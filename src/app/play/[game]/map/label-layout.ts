// label-layout.ts
export type Rect = { x: number; y: number; w: number; h: number };
export type Seg  = { x1: number; y1: number; x2: number; y2: number };
export type Star = { x: number; y: number; r: number };

export class LabelLayout {
    private placed: Rect[] = [];
    private segments: Seg[] = [];
    private stars: Star[] = [];
    private cache = new Map<string, Rect>();

    reset() {
        this.placed.length = 0;
        this.segments.length = 0;
        this.stars.length = 0;
        this.cache.clear();
    }

    addSegment(s: Seg) { this.segments.push(s); }
    addStar(c: Star)    { this.stars.push(c); }

    // ---------- geometry ----------
    private pointInRect(px: number, py: number, r: Rect) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }
    private clamp(v:number, a:number, b:number){ return Math.max(a, Math.min(b, v)); }

    private rectsOverlap(a: Rect, b: Rect, pad = 0) {
        return !(
            a.x + a.w + pad < b.x ||
            b.x + b.w + pad < a.x ||
            a.y + a.h + pad < b.y ||
            b.y + b.h + pad < a.y
        );
    }

    private det(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,x4:number,y4:number) {
        return (x4-x3)*(y1-y3)-(y4-y3)*(x1-x3);
    }
    private segmentsIntersect(a: Seg, b: Seg) {
        const d1 = this.det(a.x1,a.y1,a.x2,a.y2,b.x1,b.y1,b.x2,b.y2);
        const d2 = this.det(a.x2,a.y2,a.x1,a.y1,b.x1,b.y1,b.x2,b.y2);
        const d3 = this.det(b.x1,b.y1,b.x2,b.y2,a.x1,a.y1,a.x2,a.y2);
        const d4 = this.det(b.x2,b.y2,b.x1,b.y1,a.x1,a.y1,a.x2,a.y2);
        return (d1 * d2 >= 0) && (d3 * d4 >= 0);
    }

    private segHitsOrEntersRect(s: Seg, r: Rect, clearance = 0) {
        // Grow rect a little for clearance
        const rr: Rect = { x: r.x - clearance, y: r.y - clearance, w: r.w + 2*clearance, h: r.h + 2*clearance };

        // If either endpoint inside the (grown) rect → it "interferes"
        if (this.pointInRect(s.x1, s.y1, rr) || this.pointInRect(s.x2, s.y2, rr)) return true;

        // Otherwise check for segment-edge intersection
        const edges: Seg[] = [
            { x1: rr.x, y1: rr.y, x2: rr.x + rr.w, y2: rr.y },
            { x1: rr.x + rr.w, y1: rr.y, x2: rr.x + rr.w, y2: rr.y + rr.h },
            { x1: rr.x + rr.w, y1: rr.y + rr.h, x2: rr.x, y2: rr.y + rr.h },
            { x1: rr.x, y1: rr.y + rr.h, x2: rr.x, y2: rr.y },
        ];
        if (edges.some(e => this.segmentsIntersect(s, e))) return true;

        // Finally, allow a "near miss" buffer: if the segment comes within clearance of the rect
        // compute min distance from segment to rect by checking distance to each rect edge segment
        const minDist = edges.reduce((mn, e) => Math.min(mn, this.distSegSeg(s, e)), Number.POSITIVE_INFINITY);
        return minDist < clearance;
    }

    private distSegSeg(a: Seg, b: Seg) {
        // Approx: min distance between segment endpoints and the opposite segment
        return Math.min(
            this.distPointSeg(a.x1, a.y1, b),
            this.distPointSeg(a.x2, a.y2, b),
            this.distPointSeg(b.x1, b.y1, a),
            this.distPointSeg(b.x2, b.y2, a),
        );
    }
    private distPointSeg(px:number, py:number, s: Seg) {
        const vx = s.x2 - s.x1, vy = s.y2 - s.y1;
        const len2 = vx*vx + vy*vy || 1;
        let t = ((px - s.x1)*vx + (py - s.y1)*vy) / len2;
        t = this.clamp(t, 0, 1);
        const cx = s.x1 + t*vx, cy = s.y1 + t*vy;
        const dx = px - cx, dy = py - cy;
        return Math.hypot(dx, dy);
    }

    private rectCircleOverlap(r: Rect, c: Star, pad = 0) {
        // distance from circle center to rectangle (0 if inside)
        const cx = this.clamp(c.x, r.x, r.x + r.w);
        const cy = this.clamp(c.y, r.y, r.y + r.h);
        const dx = c.x - cx, dy = c.y - cy;
        const dist = Math.hypot(dx, dy);
        return dist < (c.r + pad);
    }

    // ---------- main picker ----------
    pick(
        ctx: CanvasRenderingContext2D,
        text: string,
        anchorX: number,
        anchorY: number,
        baseFontPx: number,
        safeBox: Rect,
        cacheKey: string,
    ): Rect {
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        const w = Math.ceil(ctx.measureText(text).width);
        const h = Math.ceil(baseFontPx * 1.2);

        const radii = [h * 1.4, h * 2.2, h * 3.2, h * 4.2];
        const dirs: ReadonlyArray<[number, number]> = [
            [0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],
        ];

        // how much clearance from lines / stars
        const lineClear = Math.max(2, baseFontPx * 0.35);
        const starClear = Math.max(2, baseFontPx * 0.25);

        let best: Rect | null = null;
        let bestScore = Number.POSITIVE_INFINITY;

        for (const r of radii) {
            for (const [dx, dy] of dirs) {
                const cx = anchorX + dx * r;
                const cy = anchorY + dy * r;
                const rect: Rect = { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };

                // must be inside safe box
                if (
                    rect.x < safeBox.x || rect.y < safeBox.y ||
                    rect.x + rect.w > safeBox.x + safeBox.w ||
                    rect.y + rect.h > safeBox.y + safeBox.h
                ) continue;

                // avoid other placed labels
                if (this.placed.some(b => this.rectsOverlap(rect, b, 2))) continue;

                // avoid lines (with clearance) and stars (dots)
                if (this.segments.some(s => this.segHitsOrEntersRect(s, rect, lineClear))) continue;
                if (this.stars.some(c => this.rectCircleOverlap(rect, c, starClear))) continue;

                // soft score: prefer close & slightly above/right
                const dist2 = (rect.x + rect.w/2 - anchorX)**2 + (rect.y + rect.h/2 - anchorY)**2;
                const bias = (dy < 0 ? 0 : h * 2) + (dx >= 0 ? 0 : h);
                const score = dist2 + bias;

                if (score < bestScore) { bestScore = score; best = rect; }
            }
            if (best) break;
        }

        const chosen = best ?? { x: Math.round(anchorX - w / 2), y: Math.round(anchorY - h / 2), w, h };
        this.placed.push(chosen);
        this.cache.set(cacheKey, chosen);
        return chosen;
    }
}
