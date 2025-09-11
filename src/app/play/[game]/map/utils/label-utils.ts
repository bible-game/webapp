
import * as THREE from "three";

// ===== Labels =====
/**
 * Make a crisp, auto-sized sprite label with word-wrapping.
 * - Sizes the canvas to the measured text (no more fixed square!)
 * - Stores desired CSS pixel size on sprite.userData so we can keep
 *   label size constant on screen in `fitSpriteToPixels`.
 */
export function makeLabel(
    text: string,
    opts?: {
        fontPx?: number;
        maxWidthPx?: number;
        paddingPx?: number;
        align?: CanvasTextAlign,
        color?: string,
        shadowColor?: string
    }) {
    const fontPx = opts?.fontPx ?? 28;           // visual font size in CSS px
    const maxWidthPx = opts?.maxWidthPx ?? 280;  // wrap long titles nicely
    const paddingPx = opts?.paddingPx ?? 12;
    const align: CanvasTextAlign = opts?.align ?? "center";

    // Prepare a measuring context
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(2, window.devicePixelRatio || 1); // cap for memory
    const font = `500 ${fontPx}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.font = font;

    // Simple word-wrap (spaces and hyphens)
    const words = text.split(/([\s\-])/); // keep delimiters so we don't lose hyphens
    const lines: string[] = [];
    let line = "";
    const measure = (t: string) => ctx.measureText(t).width;
    for (const w of words) {
        const candidate = line + w;
        if (measure(candidate) > maxWidthPx && line) {
            lines.push(line.trim());
            line = w.trimStart();
        } else {
            line = candidate;
        }
    }
    if (line.trim()) lines.push(line.trim());

    const textW = Math.min(maxWidthPx, Math.max(...lines.map(measure), 1));
    const lineHeight = Math.round(fontPx * 1.2);
    const textH = lines.length * lineHeight;

    // Final CSS size we want on screen
    const cssW = Math.ceil(textW + paddingPx * 2);
    const cssH = Math.ceil(textH + paddingPx * 2);

    // Backing store pixels for crisp rendering
    canvas.width = Math.max(2, Math.ceil(cssW * dpr));
    canvas.height = Math.max(2, Math.ceil(cssH * dpr));

    // Draw at CSS scale
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";

    // Style
    ctx.fillStyle = opts?.color ?? "white";
    ctx.shadowColor = opts?.shadowColor ?? "rgba(0,0,0,0.9)";
    ctx.shadowBlur = Math.round(fontPx * 0.4);

    // Draw
    const x = align === "center" ? cssW / 2 : align === "right" ? cssW - paddingPx : paddingPx;
    const y0 = Math.round(cssH / 2 - ((lines.length - 1) * lineHeight) / 2);
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lineHeight));

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false; // NPOT safety & crisper text

    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
    const spr = new THREE.Sprite(mat);
    (spr as any).userData = { cssW, cssH, scale: 1, lum: 0.5 };
    return spr;
}
const fadeState = new WeakMap<THREE.Sprite, { a: number; t: number }>();
let _lastCompute = 0; let _lastFrame = 0; const _tmp = new THREE.Vector3();
export function updateLabelLayoutAndFading(group: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, opts?: { maxLabels?: number; marginPx?: number; throttleMs?: number; fadeInMs?: number; fadeOutMs?: number }) {
    const now = performance.now();
    const maxLabels = opts?.maxLabels ?? 26;
    const marginPx = opts?.marginPx ?? 6;
    const throttleMs = opts?.throttleMs ?? 120;
    const fadeInMs = opts?.fadeInMs ?? 140;
    const fadeOutMs = opts?.fadeOutMs ?? 220;
    const dt = Math.max(0, now - _lastFrame); _lastFrame = now;

    const rect = renderer.domElement.getBoundingClientRect();

    if (now - _lastCompute > throttleMs) {
        _lastCompute = now;
        type Cand = { s: THREE.Sprite; lum: number; cx: number; cy: number; w: number; h: number; r2: number; z: number };
        const cand: Cand[] = [];
        group.traverse((o)=>{
            if ((o as any).isSprite){ const s=o as THREE.Sprite; s.getWorldPosition(_tmp); const p=_tmp.clone().project(camera); if(Math.abs(p.z)>1) return; const u=(s as any).userData || { cssW:0, cssH:0, scale:1, lum:0.5 }; const w=u.cssW*u.scale; const h=u.cssH*u.scale; const cx=(p.x*0.5+0.5)*rect.width; const cy=(-p.y*0.5+0.5)*rect.height; const r2=p.x*p.x + p.y*p.y; cand.push({ s, lum: u.lum ?? 0.5, cx, cy, w, h, r2, z: Math.abs(p.z) }); }
        });
        cand.sort((a,b)=> (b.lum - a.lum) || (a.r2 - b.r2) || (a.z - b.z));
        const chosen: Cand[]=[];
        const overlap=(a:Cand,b:Cand)=> !(a.cx+a.w/2+marginPx < b.cx-b.w/2 || a.cx-a.w/2-marginPx > b.cx+b.w/2 || a.cy+a.h/2+marginPx < b.cy-b.h/2 || a.cy-a.h/2-marginPx > b.cy+b.h/2);
        for (const c of cand){ if (chosen.length>=maxLabels) break; const within = c.cx>-c.w && c.cx<rect.width+c.w && c.cy>-c.h && c.cy<rect.height+c.h; if (!within) continue; let ok=true; for(const d of chosen){ if (overlap(c,d)){ ok=false; break; } } if (ok) chosen.push(c); }
        const set = new Set(chosen.map(c=>c.s));
        group.traverse((o)=>{ if ((o as any).isSprite){ const s=o as THREE.Sprite; let st=fadeState.get(s); if(!st){st={a:0,t:0}; fadeState.set(s,st);} st.t = set.has(s)? 1:0; } });
    }
    group.traverse((o)=>{ if ((o as any).isSprite){ const s=o as THREE.Sprite; let st=fadeState.get(s) ?? { a:0, t:0 }; fadeState.set(s, st); const tau = st.t > st.a ? fadeInMs : fadeOutMs; const k = 1 - Math.exp(-(dt/Math.max(1, tau))); st.a = THREE.MathUtils.lerp(st.a, st.t, k); (s.material as THREE.SpriteMaterial).opacity = st.a; } });
}
export function worldUnitsPerCssPixel(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, worldPos: THREE.Vector3) {
    const dist = camera.position.distanceTo(worldPos);
    const worldH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const px = renderer.domElement.clientHeight || 1;
    return worldH / px;
}
export function fitSpriteToPixels(s: THREE.Sprite, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const u = (s as any).userData; if (!u) return; const wp = new THREE.Vector3(); s.getWorldPosition(wp); const wu = worldUnitsPerCssPixel(camera, renderer, wp); s.scale.set(u.cssW*wu, u.cssH*wu, 1);
}
export function fitSpriteGroupToPixels(group: THREE.Group, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) { group.traverse((o)=>{ if ((o as any).isSprite) fitSpriteToPixels(o as THREE.Sprite, camera, renderer); }); }
