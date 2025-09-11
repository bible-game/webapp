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
        cellPx?: number;        // size of spatial grid cells (px). smaller => more labels
        overlapPx?: number;     // min distance between labels before we start fading (px)
        fadeBandPx?: number;    // softness around overlap threshold (px)
        maxPerCell?: number;    // allow more than one label per cell
        labelBudget?: number;   // cap on total visible labels
        getPriority?: (s: THREE.Sprite) => number; // higher keeps first
    }
) {
    const {
        cellPx = 60,          // (your previous behaviour)
        overlapPx = 28,
        fadeBandPx = 18,
        maxPerCell = 1,
        labelBudget = Infinity,
        getPriority = (s: any) => (s as any).userData?.lum ?? 0.5,
    } = opts ?? {};

    const size = renderer.getSize(new THREE.Vector2());
    const W = size.x, H = size.y;

    const tmp = new THREE.Vector3();
    const items: { s: THREE.Sprite; x: number; y: number; pr: number }[] = [];

    for (const child of group.children) {
        const s = child as THREE.Sprite;
        s.getWorldPosition(tmp).project(camera);
        const x = (tmp.x * 0.5 + 0.5) * W;
        const y = (-tmp.y * 0.5 + 0.5) * H;
        items.push({ s, x, y, pr: getPriority(s) });
    }

    // brightest/most important first
    items.sort((a, b) => b.pr - a.pr);

    // light-weight spatial hash
    const grid = new Map<string, number>();
    const key = (x: number, y: number) => `${Math.floor(x / cellPx)},${Math.floor(y / cellPx)}`;

    let shown = 0;
    for (const it of items) {
        const k = key(it.x, it.y);
        const taken = grid.get(k) ?? 0;

        let alpha = 0;

        if (taken < maxPerCell && shown < labelBudget) {
            // keep it
            alpha = 1;
            grid.set(k, taken + 1);
            shown++;
        } else {
            // soft fade near the threshold
            const t = Math.max(0, Math.min(1, (overlapPx - fadeBandPx) / Math.max(1, overlapPx)));
            alpha = t;
        }

        const mat = it.s.material as THREE.SpriteMaterial;
        mat.opacity = alpha;
        it.s.visible = alpha > 0.01;
    }
}
