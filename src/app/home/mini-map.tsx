"use client";

import React, { useEffect, useRef, useState } from "react";
import { createGridmap, type Gridmap } from "@project-gridmap/library";
import { BibleTestament, buildBibleGridmapData, colourParts, LIGHT_COLOURS, MAP_COLOURS, mapTheme } from "@/app/play/[game]/map/gridmap";

/** The phone map, as on Play, rendered at its own size and scaled into the panel */
const PHONE = { w: 360, h: 464 };
/** The panel's shape: a band across the phone map, the shape of the New Testament with a little room around it */
const BAND = 128 / 360;
/** The answer in the example guesses (How it works step 3 finds Revelation 12) */
const ANSWER = "REV/12";
const ZOOM = 3;

const LOOP = 9_000;
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * How it works, step 2: the real map. It glides in on Revelation, chapter 12 is tapped and lights in its region's
 * colour, then it glides back out (looped while in view). Reduced motion shows the tapped moment, still.
 * @since 23rd October 2026
 */
export default function MiniMap({ bible }: { bible: BibleTestament[] }) {
    const panel = useRef<HTMLDivElement>(null);
    const element = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(296 / PHONE.w);
    const [tap, setTap] = useState<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });

    useEffect(() => {
        const box = panel.current;
        if (!box) return;
        const observer = new ResizeObserver(() => setScale(box.clientWidth / PHONE.w));
        observer.observe(box);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!element.current) return;
        const map: Gridmap = createGridmap({
            container: element.current, data: buildBibleGridmapData(bible), colours: MAP_COLOURS, selectedColours: LIGHT_COLOURS,
            colourParts: colourParts(), colourBy: "item", itemLabels: "full", markType: "number", numberMinPx: 10, layout: "fit",
            showSections: true, sectionLabelSize: 9.5, theme: mapTheme(),
        });
        const internal = map as unknown as {
            model: { world: { x: number; y: number; width: number; height: number }; layers: { id: string; x: number; y: number; width: number; height: number }[]; items: { id: string; x: number; y: number; width: number; height: number; cells: { id: string; centerX: number; centerY: number }[] }[] };
            frame: (rect: unknown) => { k: number; cx: number; cy: number };
            camera: { cx: number; cy: number; k: number };
            state: { selected: unknown };
            render: () => void;
            setCamera: (cx: number, cy: number, k: number) => void;
        };

        // the two cameras: the whole New Testament (the panel's own wide, short shape), framed with a margin inside the
        // band; and Revelation, its last book, framed against the map's right edge, zoomed in
        const world = internal.model.world;
        const whole = internal.frame(world);
        const bandH = PHONE.w * BAND, margin = 14;
        const nt = internal.model.layers[internal.model.layers.length - 1];
        const fk = Math.min((PHONE.w - margin * 2) / nt.width, (bandH - margin * 2) / nt.height);
        // the testament's top edge just inside the band, so the Old Testament above stays out of view
        const far = { cx: nt.x + nt.width / 2, cy: nt.y - 6 / fk + bandH / 2 / fk, k: fk };
        const rev = internal.model.items.find(item => item.id === "REV")!;
        // close enough to tap a chapter, but never so close that Revelation (and its label) no longer fits the band
        const k = Math.min(Math.max(whole.k * ZOOM, fk * 2), (bandH - 14) / rev.height);
        const near = { cx: world.x + world.width - (PHONE.w / 2 - 6) / k, cy: rev.y + rev.height / 2 - 3 / k, k };
        const cell = rev.cells.find(c => c.id === ANSWER)!;
        const top = PHONE.h / 2 - (PHONE.w * BAND) / 2;
        const tapAt = () => ({ x: cell.centerX * k + PHONE.w / 2 - near.cx * k, y: cell.centerY * k + PHONE.h / 2 - near.cy * k - top });

        // one smooth dive: the scale changes geometrically and Revelation's place on screen moves in a straight line,
        // so the view closes in on it rather than sliding across
        const target = { x: rev.x + rev.width / 2, y: rev.y + rev.height / 2 };
        const screen = (cam: typeof far) => ({ x: (target.x - cam.cx) * cam.k, y: (target.y - cam.cy) * cam.k });
        const [from, to] = [screen(far), screen(near)];
        const show = (t: number) => {
            const e = ease(t);
            const kt = far.k * Math.pow(near.k / far.k, e);
            internal.setCamera(target.x - (from.x + (to.x - from.x) * e) / kt, target.y - (from.y + (to.y - from.y) * e) / kt, kt);
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            show(1);
            map.selectCell(ANSWER);
            setTap({ ...tapAt(), on: false });
            return () => map.destroy();
        }

        // rest on the New Testament, 16-38% zoom in, 42% tap, 42-72% hold lit, 72-90% zoom out, rest again
        let frame = 0, start = 0, visible = false, selected = false;
        const tick = (now: number) => {
            if (!start) start = now;
            const p = ((now - start) % LOOP) / LOOP;
            const zoom = p < 0.16 ? 0 : p < 0.38 ? (p - 0.16) / 0.22 : p < 0.72 ? 1 : p < 0.9 ? 1 - (p - 0.72) / 0.18 : 0;
            show(zoom);
            const lit = p >= 0.42 && p < 0.72;
            if (lit !== selected) { selected = lit; if (lit) map.selectCell(ANSWER); else { internal.state.selected = null; internal.render(); } }
            setTap(previous => { const on = p >= 0.39 && p < 0.5; return on === previous.on ? previous : { ...tapAt(), on }; });
            frame = requestAnimationFrame(tick);
        };
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting === visible) return;
            visible = entry.isIntersecting;
            if (visible) { start = 0; frame = requestAnimationFrame(tick); } else cancelAnimationFrame(frame);
        }, { threshold: 0.75 });
        observer.observe(panel.current!);
        show(0);
        return () => { observer.disconnect(); cancelAnimationFrame(frame); map.destroy(); };
    }, [bible]);

    return <div ref={panel} aria-hidden="true" className="relative w-full overflow-hidden" style={{ aspectRatio: `${1 / BAND}` }}>
        <div className="pointer-events-none absolute left-0 origin-top-left" style={{
            width: PHONE.w, height: PHONE.h, top: -(PHONE.h / 2 - (PHONE.w * BAND) / 2) * scale, transform: `scale(${scale})`,
        }}>
            <div ref={element} className="absolute inset-0"/>
        </div>
        <span className="mini-map-touch" data-on={tap.on || undefined}
              style={{ left: tap.x * scale, top: tap.y * scale }}/>
    </div>;
}
