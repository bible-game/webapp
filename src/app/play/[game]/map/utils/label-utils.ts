import * as THREE from "three";

/**
 * Label + HUD utilities for a space-themed sky.
 * - Crisp canvas-sprite text with wrapping & screen-space sizing
 * - Smart decluttering + fade in/out
 * - Stellarium-like presets (stars/constellations/planets)
 * - Futuristic HUD pill labels + leader lines
 */

// ---------- Core text sprite ----------

export type LabelOptions = {
    fontPx?: number;
    maxWidthPx?: number;
    paddingPx?: number;
    align?: CanvasTextAlign;
    color?: string;
    shadowColor?: string;

    // Modern typographic controls
    weight?: number | string;
    italic?: boolean;
    smallCaps?: boolean;
    family?: string;
    strokePx?: number;
    strokeStyle?: string;
    glow?: number;            // multiplier for shadowBlur
    trackingPx?: number;      // manual letter spacing in CSS px
    lineHeight?: number;      // multiplier (default 1.2)
    lum?: number;             // importance (for declutter sorting)
};

/**
 * Make a crisp, auto-sized sprite label with word-wrapping.
 * Stores desired CSS pixel size on sprite.userData so we can keep
 * label size constant on screen via `fitSpriteToPixels`.
 */
export function makeLabel(text: string, opts: LabelOptions = {}) {
    const fontPx = opts.fontPx ?? 28;
    const maxWidthPx = opts.maxWidthPx ?? 280;
    const paddingPx = opts.paddingPx ?? 12;
    const align: CanvasTextAlign = opts.align ?? "center";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1);

    const weight = (opts.weight ?? 600) as any;
    const italic = opts.italic ? "italic " : "";
    const variant = opts.smallCaps ? "small-caps " : "";
    const family = opts.family ?? "system-ui, -apple-system, Segoe UI, Roboto";
    const font = `${italic}${variant}${weight} ${fontPx}px ${family}`;
    ctx.font = font;

    // Simple word-wrap (split on spaces & hyphens, keep delimiters)
    const words = text.split(/([\s\-])/);
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

    const tracking = opts.trackingPx ?? 0;
    const lineWidthWithTracking = (s: string) =>
        measure(s) + Math.max(0, s.length - 1) * tracking;

    const textW = Math.min(
        maxWidthPx,
        Math.max(...lines.map(lineWidthWithTracking), 1)
    );

    const lineHeight = Math.round(fontPx * (opts.lineHeight ?? 1.2));
    const textH = Math.max(1, lines.length) * lineHeight;

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
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    // Style
    ctx.fillStyle = opts.color ?? "#b7ccff";
    ctx.shadowColor = opts.shadowColor ?? "rgba(10,18,37,0.85)";
    ctx.shadowBlur = Math.round(fontPx * (opts.glow ?? 0.7));

    const drawLine = (str: string, yy: number) => {
        const spacing = tracking;
        if (!spacing) {
            if (opts.strokePx) {
                ctx.lineWidth = opts.strokePx;
                ctx.strokeStyle = opts.strokeStyle ?? "rgba(3,6,12,0.95)";
                ctx.strokeText(str, x, yy);
            }
            ctx.fillText(str, x, yy);
            return;
        }
        // Manual letter-spacing
        const baseMeasure = (t: string) => ctx.measureText(t).width;
        let cx = x;
        if (align === "center") cx -= baseMeasure(str) / 2 + (str.length - 1) * spacing * 0.5;
        else if (align === "right") cx -= baseMeasure(str) + (str.length - 1) * spacing;

        for (const ch of str) {
            if (opts.strokePx) {
                ctx.lineWidth = opts.strokePx;
                ctx.strokeStyle = opts.strokeStyle ?? "rgba(3,6,12,0.95)";
                ctx.strokeText(ch, cx, yy);
            }
            ctx.fillText(ch, cx, yy);
            cx += baseMeasure(ch) + spacing;
        }
    };

    const x =
        align === "center"
            ? cssW / 2
            : align === "right"
                ? cssW - paddingPx
                : paddingPx;
    const y0 = Math.round(cssH / 2 - ((lines.length - 1) * lineHeight) / 2);
    lines.forEach((l, i) => drawLine(l, y0 + i * lineHeight));

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false; // NPOT safety & crisper text

    const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0, // fade in via updater
    });
    const spr = new THREE.Sprite(mat);
    (spr as any).userData = { cssW, cssH, scale: 1, lum: opts.lum ?? 0.5 };
    return spr;
}

// ---------- Layout, sizing & fading ----------

const fadeState = new WeakMap<THREE.Sprite, { a: number; t: number }>();
let _lastCompute = 0;
let _lastFrame = 0;
const _tmp = new THREE.Vector3();

export function worldUnitsPerCssPixel(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    worldPos: THREE.Vector3
) {
    const dist = camera.position.distanceTo(worldPos);
    const worldH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const px = renderer.domElement.clientHeight || 1;
    return worldH / px;
}

export function fitSpriteToPixels(
    s: THREE.Sprite,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
) {
    const u = (s as any).userData;
    if (!u) return;
    s.getWorldPosition(_tmp);
    const wu = worldUnitsPerCssPixel(camera, renderer, _tmp);
    s.scale.set(u.cssW * wu, u.cssH * wu, 1);
}

export function fitSpriteGroupToPixels(
    group: THREE.Group,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
) {
    group.traverse((o) => {
        if ((o as any).isSprite) fitSpriteToPixels(o as THREE.Sprite, camera, renderer);
    });
}

/**
 * Declutter + fade labels. Call each frame (or throttled).
 * Chooses up to maxLabels, avoids overlaps, fades chosen in and others out.
 */
export function updateLabelLayoutAndFading(
    group: THREE.Group,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    opts?: {
        maxLabels?: number;
        marginPx?: number;
        throttleMs?: number;
        fadeInMs?: number;
        fadeOutMs?: number;
    }
) {
    const now = performance.now();
    const maxLabels = opts?.maxLabels ?? 26;
    const marginPx = opts?.marginPx ?? 6;
    const throttleMs = opts?.throttleMs ?? 120;
    const fadeInMs = opts?.fadeInMs ?? 140;
    const fadeOutMs = opts?.fadeOutMs ?? 220;
    const dt = Math.max(0, now - _lastFrame);
    _lastFrame = now;

    const rect = renderer.domElement.getBoundingClientRect();

    // Recompute selection on throttle
    if (now - _lastCompute > throttleMs) {
        _lastCompute = now;

        type Cand = {
            s: THREE.Sprite;
            lum: number;
            cx: number;
            cy: number;
            w: number;
            h: number;
            r2: number;
            z: number;
        };

        const cand: Cand[] = [];

        group.traverse((o) => {
            if (!(o as any).isSprite) return;
            const s = o as THREE.Sprite;
            s.getWorldPosition(_tmp);
            _tmp.project(camera);
            if (_tmp.z > 1) return; // behind camera

            const u = (s as any).userData ?? {};
            const cssW = u.cssW ?? 100;
            const cssH = u.cssH ?? 30;

            const cx = (( _tmp.x + 1 ) * 0.5) * rect.width;
            const cy = ((- _tmp.y + 1 ) * 0.5) * rect.height;
            const w = cssW;
            const h = cssH;
            const r2 = (cx - rect.width/2) ** 2 + (cy - rect.height/2) ** 2;

            cand.push({
                s,
                lum: u.lum ?? 0.5,
                cx,
                cy,
                w,
                h,
                r2,
                z: Math.abs(_tmp.z),
            });
        });

        // Sort: brighter first, nearer center, then nearer camera
        cand.sort((a, b) => (b.lum - a.lum) || (a.r2 - b.r2) || (a.z - b.z));

        // Greedy non-overlap selection
        const chosen: Cand[] = [];
        const overlap = (a: Cand, b: Cand) =>
            !(a.cx + a.w/2 + marginPx < b.cx - b.w/2 ||
                a.cx - a.w/2 - marginPx > b.cx + b.w/2 ||
                a.cy + a.h/2 + marginPx < b.cy - b.h/2 ||
                a.cy - a.h/2 - marginPx > b.cy + b.h/2);

        for (const c of cand) {
            if (chosen.length >= maxLabels) break;
            let ok = true;
            for (const d of chosen) { if (overlap(c, d)) { ok = false; break; } }
            if (ok) chosen.push(c);
        }

        const chosenSet = new Set(chosen.map((c) => c.s));
        group.traverse((o) => {
            if (!(o as any).isSprite) return;
            const s = o as THREE.Sprite;
            let st = fadeState.get(s);
            if (!st) { st = { a: 0, t: 0 }; fadeState.set(s, st); }
            st.t = chosenSet.has(s) ? 1 : 0;
        });
    }

    // Animate opacity
    group.traverse((o) => {
        if (!(o as any).isSprite) return;
        const s = o as THREE.Sprite;
        let st = fadeState.get(s);
        if (!st) { st = { a: 0, t: 0 }; fadeState.set(s, st); }

        const T = st.t ? (opts?.fadeInMs ?? fadeInMs) : (opts?.fadeOutMs ?? fadeOutMs);
        const k = T <= 0 ? 1 : Math.min(1, dt / T);
        st.a += (st.t - st.a) * k;

        (s.material as THREE.SpriteMaterial).opacity = st.a;
    });
}

// ---------- Stellarium-like presets ----------

export function makeStarLabel(
    text: string,
    magnitude: number,
    opts?: Partial<LabelOptions>
) {
    const m = Math.max(-1, Math.min(6, magnitude));
    const fontPx = Math.round(26 - 2.2 * m); // brighter -> bigger
    const lum = -magnitude; // used by declutter sort
    return makeLabel(text, {
        fontPx,
        color: "#bcd6ff",
        shadowColor: "rgba(18,34,64,0.9)",
        glow: 0.8,
        strokePx: 2,
        strokeStyle: "rgba(8,14,30,0.95)",
        weight: 600,
        ...opts,
        lum,
    });
}

export function makeConstellationLabel(
    text: string,
    opts?: Partial<LabelOptions>
) {
    return makeLabel(text.toUpperCase(), {
        fontPx: 20,
        color: "#9cc2ff",
        shadowColor: "rgba(12,24,48,0.85)",
        glow: 0.6,
        strokePx: 2,
        strokeStyle: "rgba(6,10,20,0.9)",
        weight: 500,
        smallCaps: true,
        trackingPx: 1.2,
        ...opts,
        lum: 0.3,
    });
}

export function makePlanetLabel(
    text: string,
    opts?: Partial<LabelOptions>
) {
    return makeLabel(text, {
        fontPx: 24,
        color: "#ffd39c",
        shadowColor: "rgba(60,38,6,0.85)",
        glow: 0.7,
        strokePx: 2,
        strokeStyle: "rgba(20,14,4,0.9)",
        weight: 600,
        italic: true,
        ...opts,
        lum: 0.7,
    });
}

/** Optional: fade labels into the horizon like Stellarium. Call after updateLabelLayoutAndFading */
export function applyHorizonFade(group: THREE.Group) {
    const tmp = new THREE.Vector3();
    const sstep = (a: number, b: number, x: number) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    };
    group.traverse((o) => {
        if (!(o as any).isSprite) return;
        const s = o as THREE.Sprite;
        s.getWorldPosition(tmp);
        const len = tmp.length() || 1;
        const alt = Math.asin(Math.max(-1, Math.min(1, tmp.y / len))); // radians
        const fade = sstep(THREE.MathUtils.degToRad(-6), THREE.MathUtils.degToRad(3), alt);
        const mat = s.material as THREE.SpriteMaterial;
        mat.opacity *= fade;
    });
}

// ---------- Futuristic HUD pill labels ----------

export function makeHudLabel(
    text: string,
    opts?: {
        fontPx?: number;
        icon?: string;
        iconPx?: number;
        paddingPx?: number;
        tint?: string;       // main hue (e.g., "#7ab6ff")
        accent?: string;     // top gradient color
        bg?: string;         // base glass fill
        trackingPx?: number;
        lineHeight?: number;
        weight?: number | string;
        smallCaps?: boolean;
        italic?: boolean;
        family?: string;
        lum?: number;
    }
) {
    const fontPx = opts?.fontPx ?? 20;
    const iconPx = opts?.iconPx ?? Math.round(fontPx * 0.95);
    const paddingPx = opts?.paddingPx ?? 12;
    const tint = opts?.tint ?? "#7ab6ff";
    const accent = opts?.accent ?? "#bde1ff";
    const bg = opts?.bg ?? "rgba(10,16,30,0.35)";
    const tracking = opts?.trackingPx ?? 0;
    const lineHeight = Math.round(fontPx * (opts?.lineHeight ?? 1.2));
    const family = opts?.family ?? "system-ui, -apple-system, Segoe UI, Roboto";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1);

    const weight = (opts?.weight ?? 600) as any;
    const italic = opts?.italic ? "italic " : "";
    const variant = opts?.smallCaps ? "small-caps " : "";
    const font = `${italic}${variant}${weight} ${fontPx}px ${family}`;
    ctx.font = font;

    // Measure (with manual letter spacing)
    const m = (s: string) => ctx.measureText(s).width + Math.max(0, s.length - 1) * tracking;
    const textW = Math.ceil(m(text));
    const iconW = opts?.icon ? iconPx + Math.ceil(fontPx * 0.5) : 0;
    const cssW = textW + iconW + paddingPx * 2;
    const cssH = Math.max(iconPx, lineHeight) + paddingPx * 2;

    canvas.width = Math.max(2, Math.ceil(cssW * dpr));
    canvas.height = Math.max(2, Math.ceil(cssH * dpr));
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    // Rounded rect path
    const r = Math.min(16, Math.round(cssH * 0.5));
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(cssW, 0, cssW, cssH, r);
    ctx.arcTo(cssW, cssH, 0, cssH, r);
    ctx.arcTo(0, cssH, 0, 0, r);
    ctx.arcTo(0, 0, cssW, 0, r);
    ctx.closePath();

    // Glass fill
    const g = ctx.createLinearGradient(0, 0, 0, cssH);
    g.addColorStop(0, "rgba(255,255,255,0.06)");
    g.addColorStop(0.5, bg);
    g.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = g;
    ctx.fill();

    // Neon border
    const b = ctx.createLinearGradient(0, 0, cssW, cssH);
    b.addColorStop(0, accent);
    b.addColorStop(1, tint);
    ctx.strokeStyle = b;
    ctx.lineWidth = 2;
    ctx.shadowColor = tint;
    ctx.shadowBlur = Math.round(fontPx * 0.7);
    ctx.stroke();

    // Inner top sheen
    ctx.save();
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, 0, 0, cssH);
    sheen.addColorStop(0, "rgba(255,255,255,0.18)");
    sheen.addColorStop(0.35, "rgba(255,255,255,0.04)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, cssW, cssH * 0.75);
    ctx.restore();

    // Text gradient
    const tg = ctx.createLinearGradient(0, 0, 0, cssH);
    tg.addColorStop(0, accent);
    tg.addColorStop(1, "#d7e6ff");
    ctx.fillStyle = tg;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = font;

    // Optional icon
    let x = paddingPx;
    const cy = Math.round(cssH / 2);
    if (opts?.icon) {
        ctx.shadowColor = tint;
        ctx.shadowBlur = Math.round(fontPx * 0.4);
        ctx.font = `${weight} ${iconPx}px ${family}`;
        ctx.fillText(opts.icon, x, cy + 1);
        x += iconPx + Math.ceil(fontPx * 0.5);
        ctx.font = font;
    }

    // Manual letter spacing
    const baseMeasure = (t: string) => ctx.measureText(t).width;
    let cx = x;
    for (const ch of text) {
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.shadowBlur = 0;
        ctx.fillText(ch, cx, cy);
        cx += baseMeasure(ch) + tracking;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;

    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
    const spr = new THREE.Sprite(mat);
    (spr as any).userData = { cssW, cssH, scale: 1, lum: opts?.lum ?? 0.6 };
    return spr;
}

// ---------- Leader lines ----------

/**
 * Simple leader line from an anchor world position to a label.
 * Recompute endpoints every frame with updateLeaderLine in your render loop.
 */
export function makeLeaderLine(
    color = new THREE.Color(0x86b7ff),
    opacity = 0.7
) {
    const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
    ]);
    const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geom, mat);
    (line as any).userData = { a: new THREE.Vector3(), b: new THREE.Vector3() };
    return line;
}

export function updateLeaderLine(
    line: THREE.Line,
    a: THREE.Vector3,
    b: THREE.Vector3
) {
    const g = line.geometry as THREE.BufferGeometry;
    const attr = g.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    arr[0] = a.x; arr[1] = a.y; arr[2] = a.z;
    arr[3] = b.x; arr[4] = b.y; arr[5] = b.z;
    attr.needsUpdate = true;
}
