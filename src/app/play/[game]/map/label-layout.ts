// label-layout.ts
// Groups: prefer outside of their box.
// Chapters: hug the star, with star-size-aware clearance and max distance cap.

type Rect = { x: number; y: number; w: number; h: number };
type Seg  = { x1: number; y1: number; x2: number; y2: number };
type Star = { x: number; y: number; r: number };

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function rectsOverlap(a: Rect, b: Rect, pad = 0): boolean {
    return !(
        a.x + a.w + pad <= b.x ||
        b.x + b.w + pad <= a.x ||
        a.y + a.h + pad <= b.y ||
        b.y + b.h + pad <= a.y
    );
}
function det(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,x4:number,y4:number) {
    return (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
}
function segmentsIntersect(a: Seg, b: Seg): boolean {
    // Inclusive segment intersection
    const d = det(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2);
    if (Math.abs(d) < 1e-9) {
        // Parallel/collinear: bbox overlap test
        const minAx = Math.min(a.x1, a.x2), maxAx = Math.max(a.x1, a.x2);
        const minAy = Math.min(a.y1, a.y2), maxAy = Math.max(a.y1, a.y2);
        const minBx = Math.min(b.x1, b.x2), maxBx = Math.max(b.x1, b.x2);
        const minBy = Math.min(b.y1, b.y2), maxBy = Math.max(b.y1, b.y2);
        const overlapX = !(maxAx < minBx || maxBx < minAx);
        const overlapY = !(maxAy < minBy || maxBy < minAy);
        return overlapX && overlapY;
    }
    const ua = det(b.x1, b.y1, b.x2, b.y2, b.x1, b.y1, a.x1, a.y1) / d;
    const ub = det(a.x1, a.y1, a.x2, a.y2, a.x1, a.y1, b.x1, b.y1) / d;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}
function pointInRect(px: number, py: number, r: Rect): boolean {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
function segHitsOrEntersRect(s: Seg, r: Rect, clearance = 0): boolean {
    const rr: Rect = { x: r.x - clearance, y: r.y - clearance, w: r.w + 2 * clearance, h: r.h + 2 * clearance };
    if (pointInRect(s.x1, s.y1, rr) || pointInRect(s.x2, s.y2, rr)) return true;
    const edges: Seg[] = [
        { x1: rr.x, y1: rr.y, x2: rr.x + rr.w, y2: rr.y },
        { x1: rr.x + rr.w, y1: rr.y, x2: rr.x + rr.w, y2: rr.y + rr.h },
        { x1: rr.x + rr.w, y1: rr.y + rr.h, x2: rr.x, y2: rr.y + rr.h },
        { x1: rr.x, y1: rr.y + rr.h, x2: rr.x, y2: rr.y },
    ];
    return edges.some(e => segmentsIntersect(e, s));
}
function rectCircleOverlap(r: Rect, c: Star, pad = 0): boolean {
    const cx = clamp(c.x, r.x, r.x + r.w);
    const cy = clamp(c.y, r.y, r.y + r.h);
    const dx = c.x - cx, dy = c.y - cy;
    return Math.hypot(dx, dy) < (c.r + pad);
}
function safeCanvasSize(ctx: CanvasRenderingContext2D, fbW: number, fbH: number) {
    const anyCtx: any = ctx as any;
    const cw = Number.isFinite(anyCtx?.canvas?.width)  ? anyCtx.canvas.width  : fbW;
    const ch = Number.isFinite(anyCtx?.canvas?.height) ? anyCtx.canvas.height : fbH;
    return { cw, ch };
}

// Tunables (sane defaults; can be changed from code if you want)
type LayoutOptions = {
    // Max radial distance from a chapter's star EDGE to the label's NEAREST edge (px)
    maxChapterOffsetPx: number;
    // Extra glow/halo beyond star radius, proportional to star r
    chapterHaloFactor: number;      // multiplied by star.r
    // Minimum halo (px) so tiny stars still get a little breathing room
    chapterHaloMinPx: number;       // absolute minimum
};
const DEFAULTS: LayoutOptions = {
    maxChapterOffsetPx: 0,     // <- hard cap on how far a chapter label can be from its star
    chapterHaloFactor: 0.9,     // <- star-aware clearance: 0.9 * r
    chapterHaloMinPx: 0.5,      // <- at least 0.5px of extra gap
};

export class LabelLayout {
    private placed: Rect[] = [];
    private segments: Seg[] = [];
    private stars: Star[] = [];
    private cache = new Map<string, Rect>();
    private opts: LayoutOptions;

    constructor(opts?: Partial<LayoutOptions>) {
        this.opts = {...DEFAULTS, ...(opts || {})};
    }

    reset() {
        this.placed = [];
        this.segments = [];
        this.stars = [];
        this.cache.clear();
    }

    addSegment(s: Seg) {
        this.segments.push(s);
    }

    addStar(c: Star) {
        this.stars.push(c);
    }

    /**
     * Pick a rectangle for a label near (anchorX, anchorY) within 'safeBox'.
     * Strategy by key:
     *   - "group:*"   → outside the group box (top/bottom/left/right)
     *   - others      → star-hugging (chapter labels)
     */
    pick(
        ctx: CanvasRenderingContext2D,
        text: string,
        anchorX: number,
        anchorY: number,
        baseFontPx: number,
        safeBox: Rect,
        cacheKey: string
    ): Rect {
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        const rect =
            cacheKey.startsWith("group:")
                ? this.pickGroupOutside(ctx, text, baseFontPx, safeBox)
                : this.pickChapterHug(ctx, text, anchorX, anchorY, baseFontPx, safeBox);

        this.cache.set(cacheKey, rect);
        this.placed.push(rect);
        return rect;
    }

    // ---------- Groups: prefer outside ----------
    private pickGroupOutside(
        ctx: CanvasRenderingContext2D,
        text: string,
        base: number,
        box: Rect
    ): Rect {
        const w = Math.ceil(ctx.measureText(text).width);
        const h = Math.ceil(base * 1.2);

        // Keep the group gap modest but readable (unrelated to star size)
        const lineClear = Math.max(2, base * 0.35);
        const starClear = Math.max(2, base * 0.25);
        const edgeGap = Math.max(lineClear, starClear) + Math.ceil(base * 0.2);
        const pad = Math.max(4, base * 0.8);

        const {cw, ch} = safeCanvasSize(
            ctx,
            Math.ceil(box.x + box.w + edgeGap * 4),
            Math.ceil(box.y + box.h + edgeGap * 4)
        );

        const offsets = [edgeGap, edgeGap + 6, edgeGap + 12];
        for (const off of offsets) {
            const candidates: Rect[] = [
                // TOP
                {
                    x: Math.round(clamp(box.x + (box.w - w) / 2, pad, cw - w - pad)),
                    y: Math.round(clamp(box.y - off - h, 0, ch - h)), w, h
                },
                // BOTTOM
                {
                    x: Math.round(clamp(box.x + (box.w - w) / 2, pad, cw - w - pad)),
                    y: Math.round(clamp(box.y + box.h + off, 0, ch - h)), w, h
                },
                // LEFT
                {
                    x: Math.round(clamp(box.x - off - w, 0, cw - w)),
                    y: Math.round(clamp(box.y + (box.h - h) / 2, pad, ch - h - pad)), w, h
                },
                // RIGHT
                {
                    x: Math.round(clamp(box.x + box.w + off, 0, cw - w)),
                    y: Math.round(clamp(box.y + (box.h - h) / 2, pad, ch - h - pad)), w, h
                },
            ];

            for (const r of candidates) {
                if (this.placed.some(b => rectsOverlap(r, b, 2))) continue;
                if (this.segments.some(s => segHitsOrEntersRect(s, r, lineClear))) continue;
                if (this.stars.some(c => rectCircleOverlap(r, c, starClear))) continue;
                return r;
            }
        }

        // Fallback: inside center of the box
        return {
            x: Math.round(box.x + (box.w - w) / 2),
            y: Math.round(box.y + (box.h - h) / 2),
            w, h
        };
    }

    // Chapters: star-hugging with star-size-aware clearance and a HARD max distance cap.
    private pickChapterHug(
        ctx: CanvasRenderingContext2D,
        text: string,
        ax: number,
        ay: number,
        base: number,
        box: Rect
    ): Rect {
        const w = Math.ceil(ctx.measureText(text).width);
        const h = Math.ceil(base * 1.2);

        // Find nearest star (to size the halo + anchor distance)
        let nearestR = 0, nearestD = Number.POSITIVE_INFINITY;
        for (const s of this.stars) {
            const d = Math.hypot(ax - s.x, ay - s.y);
            if (d < nearestD) {
                nearestD = d;
                nearestR = s.r;
            }
        }

        // --- HARD CAP + star-aware halo (bounded by the cap) ---
        const cap = Math.max(0, this.opts.maxChapterOffsetPx); // user’s hard limit in px
        const desiredHalo = Math.max(this.opts.chapterHaloMinPx, nearestR * this.opts.chapterHaloFactor);
        // Effective halo is limited by the cap, so the cap always “wins”
        const halo = Math.min(cap, desiredHalo);

        // Collision clearances
        const lineClear = Math.max(1, base * 0.22);
        // IMPORTANT: allow true tangency when cap==0 by keeping starClear <= cap
        const starClear = Math.min(cap, Math.max(0, Math.min(1, desiredHalo)));

        // Helper
        const isValid = (r: Rect) =>
            !(r.x < box.x || r.y < box.y || r.x + r.w > box.x + box.w || r.y + r.h > box.y + box.h) &&
            !this.placed.some(b => rectsOverlap(r, b, 1.25)) &&
            !this.segments.some(s => segHitsOrEntersRect(s, r, lineClear)) &&
            !this.stars.some(c => rectCircleOverlap(r, c, starClear));

        // We "edge-lock" the nearest edge at (nearestR + g) and slide tangentially first.
        const slideStep = Math.max(2, Math.round(base * 0.6));
        const slideMax = Math.max(12, Math.round(base * 6));
        const slides: number[] = [0];
        for (let d = slideStep; d <= slideMax; d += slideStep) slides.push(d, -d);

        // Sides ordered by available room (TOP/RIGHT bias when similar)
        const sides = [
            {id: "TOP", room: ay - box.y, bias: 0},
            {id: "RIGHT", room: box.x + box.w - ax, bias: 1},
            {id: "BOTTOM", room: box.y + box.h - ay, bias: 2},
            {id: "LEFT", room: ax - box.x, bias: 3},
        ].sort((a, b) => (b.room - a.room) || (a.bias - b.bias));

        // Try gaps from (halo) up to cap. If cap==0, this loop tries 0 only.
        const gapSteps: number[] = [];
        // start at halo (may be 0), step by 1–2px until the cap
        const gapStepPx = Math.max(1, Math.round(base * 0.4));
        for (let g = halo; g <= cap; g += gapStepPx) gapSteps.push(g);
        if (gapSteps.length === 0) gapSteps.push(0); // when halo>cap (shouldn't happen now), still try 0

        for (const g of gapSteps) {
            for (const s of sides) {
                for (const t of slides) {
                    let cand: Rect;
                    switch (s.id) {
                        case "TOP":
                            cand = {x: Math.round(ax - w / 2 + t), y: Math.round(ay - (nearestR + g) - h), w, h};
                            break;
                        case "BOTTOM":
                            cand = {x: Math.round(ax - w / 2 + t), y: Math.round(ay + (nearestR + g)), w, h};
                            break;
                        case "RIGHT":
                            cand = {x: Math.round(ax + (nearestR + g)), y: Math.round(ay - h / 2 + t), w, h};
                            break;
                        default: // LEFT
                            cand = {x: Math.round(ax - (nearestR + g) - w), y: Math.round(ay - h / 2 + t), w, h};
                    }
                    // Keep the tangential slide inside the box (doesn't change radial gap)
                    cand.x = clamp(cand.x, box.x, box.x + box.w - w);
                    cand.y = clamp(cand.y, box.y, box.y + box.h - h);

                    if (isValid(cand)) return cand;
                }
            }
        }

        // No valid placement found within the cap — as a strict rule, we DON'T exceed it.
        // Last resort: clamp a tangential slide at the cap above the star (still <= cap).
        const g = cap;
        const fallback: Rect = {
            x: clamp(Math.round(ax - w / 2), box.x, box.x + box.w - w),
            y: clamp(Math.round(ay - (nearestR + g) - h), box.y, box.y + box.h - h),
            w, h
        };
        if (isValid(fallback)) return fallback;

        // If even that fails, try sliding on the top side at the cap.
        const altSlides = [0, slideStep, -slideStep, 2 * slideStep, -2 * slideStep];
        for (const t of altSlides) {
            const alt: Rect = {
                x: clamp(Math.round(ax - w / 2 + t), box.x, box.x + box.w - w),
                y: clamp(Math.round(ay - (nearestR + g) - h), box.y, box.y + box.h - h),
                w, h
            };
            if (isValid(alt)) return alt;
        }

        // Absolute last resort: return the unclamped TOP position (may overlap if space is truly blocked)
        return fallback;
    }

}
