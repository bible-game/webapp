// star-renderer.ts
// API: renderStar(ctx, { x, y, radius, tint })
// Photoreal cues: white/blue core with filmic tonemap, tinted/elliptical halo,
// faint Airy rings, subtle horizontal lens streak,
// mild chromatic aberration. All config stays here.

export type RenderStarArgs = { x: number; y: number; radius: number; tint: string };

type Config = {
    intensity: number;          // global brightness
    haloScale: number;          // outer glow size multiplier
    blueCore: number;           // 0–1 blue-ish hot center
    redFringe: number;          // 0–1 red outer tint
    chromaShift: number;        // px shift for RGB fringing on halo
    airyStrength: number;       // 0–1 first diffraction ring
    airyWidth: number;          // relative ring thickness to radius
    lensStreak: number;         // 0–1 anamorphic streak
    twinkle: number;            // 0–1 per-draw jitter
    ellipticity: number;        // 0–0.4 slight halo squish
};

const CONFIG: Config = {
    intensity: 1.0,
    haloScale: 0.5,
    blueCore: 0.60,
    redFringe: 0.28,
    chromaShift: 0.6,
    airyStrength: 0.18,
    airyWidth: 0.28,
    lensStreak: 0.22,
    twinkle: 0.035,
    ellipticity: 0.12
};

export function renderStar(ctx: CanvasRenderingContext2D, args: RenderStarArgs) {
    let { x, y, radius, tint } = args;
    if (isNaN(radius) || !isFinite(radius)) radius = 0.1; // question :: more appropriate value?

    const C = CONFIG;
    const boost = C.intensity * (1 + (Math.random() * 2 - 1) * C.twinkle);
    const haloR = Math.max(radius * 2.2, radius * C.haloScale);

    // Deterministic per-star orientation for halo/stretch using a quick hash of position
    const seed = pseudoHash(x, y, radius);
    const rot = (seed % 1) * Math.PI;          // 0..π
    const haloSquish = 1 - C.ellipticity * (0.7 + 0.3 * (seed % 1)); // 1.0 → circle

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    const prevOp = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";

    // --- WHITE/BLUE CORE with filmic rolloff -----------------------
    // “Filmic” = emulate highlight compression by stacking two gradients
    const core1 = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    core1.addColorStop(0.0, rgba(255, 255, 255, tmap(1.0 * boost)));
    core1.addColorStop(0.28, rgba(220, 235, 255, tmap(0.8 * boost * C.blueCore)));
    core1.addColorStop(0.65, withAlpha(tint, tmap(0.8 * boost)));
    core1.addColorStop(1.0, withAlpha(tint, 0));

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = core1;
    ctx.fill();

    // --- SLIGHTLY ELLIPTICAL TINTED HALO + chromatic fringe --------
    // draw halo in a squashed space to hint atmosphere/sensor
    ctx.save();
    ctx.scale(1, haloSquish);

    // main tinted halo
    const haloGrad = ctx.createRadialGradient(0, 0, radius * 0.12, 0, 0, haloR);
    haloGrad.addColorStop(0.0, withAlpha(tint, 0.46 * boost));
    haloGrad.addColorStop(0.45, withAlpha(tint, 0.18 * boost));
    const red = shiftHue(tint, +22);
    haloGrad.addColorStop(0.82, withAlpha(red, 0.10 * boost * C.redFringe));
    haloGrad.addColorStop(1.0, withAlpha(red, 0));
    ctx.beginPath();
    ctx.arc(0, 0, haloR, 0, Math.PI * 2);
    ctx.fillStyle = haloGrad;
    ctx.fill();

    // subtle RGB fringing (shift three faint halos)
    if (C.chromaShift > 0) {
        const sh = C.chromaShift;
        drawOffsetHalo(ctx, haloR, rgb(255, 80, 80), -sh, 0, 0.05 * boost);
        drawOffsetHalo(ctx, haloR, rgb(80, 255, 255), +sh, 0, 0.05 * boost);
    }

    ctx.restore(); // end squashed halo space

    // --- AIRY RING (first diffraction ring) ------------------------
    if (C.airyStrength > 0) drawAiryRing(ctx, radius, tint, C.airyWidth, C.airyStrength * boost);

    // --- ANAMORPHIC LENS STREAK ------------------------------------
    if (C.lensStreak > 0) {
        const L = haloR * 2.6;
        const H = Math.max(1, radius * 0.32);
        const grad = ctx.createLinearGradient(-L, 0, L, 0);
        grad.addColorStop(0.0, rgba(255, 255, 255, 0));
        grad.addColorStop(0.45, withAlpha(tint, 0.10 * boost * C.lensStreak));
        grad.addColorStop(0.5, rgba(255, 255, 255, 0.18 * boost * C.lensStreak));
        grad.addColorStop(0.55, withAlpha(tint, 0.10 * boost * C.lensStreak));
        grad.addColorStop(1.0, rgba(255, 255, 255, 0));

        ctx.save();
        ctx.filter = "blur(0.5px)";
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }

    ctx.globalCompositeOperation = prevOp;
    ctx.restore();
}

/* ----------------- internals ----------------- */

function drawAiryRing(
    ctx: CanvasRenderingContext2D,
    radius: number,
    tint: string,
    ringWidthRel: number,
    strength: number
) {
    const r0 = radius * (1.35); // first ring just outside core
    const w = Math.max(0.75, radius * ringWidthRel);
    // gradient across the stroke width (soft edges)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r0 + w);
    g.addColorStop(0.0, rgba(255, 255, 255, 0));
    g.addColorStop(0.45, withAlpha(tint, 0.07 * strength));
    g.addColorStop(0.5, rgba(255, 255, 255, 0.14 * strength));
    g.addColorStop(0.55, withAlpha(tint, 0.07 * strength));
    g.addColorStop(1.0, rgba(255, 255, 255, 0));
    ctx.beginPath();
    ctx.arc(0, 0, r0, 0, Math.PI * 2);
    ctx.strokeStyle = g;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.stroke();
}

function drawOffsetHalo(ctx: CanvasRenderingContext2D, R: number, color: string, dx: number, dy: number, alpha: number) {
    const g = ctx.createRadialGradient(dx, dy, R * 0.2, dx, dy, R);
    g.addColorStop(0, rgba255a(255, 255, 255, alpha * 0.25));
    g.addColorStop(0.6, withAlpha(color, alpha * 0.35));
    g.addColorStop(1, rgba255a(255, 255, 255, 0));
    ctx.beginPath();
    ctx.arc(dx, dy, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
}

function withAlpha(color: string, a: number) {
    const c = color.trim();
    if (c.startsWith("#")) { const { r, g, b } = hexToRgb(c); return rgba(r, g, b, a); }
    if (/^rgb\(/i.test(c)) {
        const nums = c.match(/\d+(\.\d+)?/g)?.map(Number) || [255, 255, 255];
        return rgba(nums[0] ?? 255, nums[1] ?? 255, nums[2] ?? 255, a);
    }
    return rgba(255, 255, 255, a);
}

function shiftHue(col: string, deg: number) {
    const { r, g, b } = hexToRgb(col);
    const { h, s, l } = rgbToHsl(r, g, b);
    const hh = (h + deg + 360) % 360;
    const { r: rr, g: gg, b: bb } = hslToRgb(hh, s, l);
    return `rgb(${rr}, ${gg}, ${bb})`;
}

function hexToRgb(hex: string) {
    let h = hex.replace("#", "");
    if (h.length === 3 || h.length === 4) h = h.split("").map(c => c + c).join("");
    if (h.length === 6) h += "ff";
    const n = parseInt(h, 16);
    return { r: (n >> 24) & 255, g: (n >> 16) & 255, b: (n >> 8) & 255, a: n & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
    r/=255; g/=255; b/=255; const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h=0, s=0, l=(max+min)/2;
    if (max!==min) { const d=max-min; s=l>.5?d/(2-max-min):d/(max+min);
        switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}
        h*=60;
    }
    return {h,s,l};
}
function hslToRgb(h:number,s:number,l:number){
    const f=(n:number,k=(n+h/30)%12)=>l-s*Math.min(l,1-l)*Math.max(-1,Math.min(k-3,Math.min(9-k,1)));
    return { r:Math.round(255*f(0)), g:Math.round(255*f(8)), b:Math.round(255*f(4)) };
}
function rgba(r:number,g:number,b:number,a:number){ return `rgba(${r}, ${g}, ${b}, ${Math.max(0,Math.min(1,a))})`; }
function rgba255a(r:number,g:number,b:number,a:number){ return rgba(r,g,b,a); }
function rgb(r:number,g:number,b:number){ return `rgb(${r}, ${g}, ${b})`; }
function tmap(x:number){ // simple highlight rolloff
    return x/(1+x); // Reinhard tonemap-esque
}
function pseudoHash(x:number,y:number,r:number){
    // tiny deterministic noise from inputs
    const s=Math.sin(x*12.9898 + y*78.233 + r*37.719)*43758.5453;
    return s - Math.floor(s);
}
