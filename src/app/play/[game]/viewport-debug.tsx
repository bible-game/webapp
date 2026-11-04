"use client"

import React, { useEffect, useRef, useState } from "react";

/**
 * TEMPORARY: a live readout of the viewport, for the DuckDuckGo (Android) spacing and map-jumping bug. Shown only with
 * ?debug=viewport on the play page. Remove once that's resolved.
 *
 * It samples every frame and shows each value now, its range since load (or since the last tap on the panel) and how
 * many times it changed, plus the last few changes, so a jump can be read back after it happens.
 */

type Sample = Record<string, number>;
type Stat = { now: number; min: number; max: number; changes: number };

const LOG_SIZE = 6;

/** The safe-area insets as this browser reports them, read off a hidden element padded by them */
function insets(probe: HTMLDivElement): Sample {
    const style = getComputedStyle(probe);
    return {
        "inset top": parseFloat(style.paddingTop) || 0,
        "inset bottom": parseFloat(style.paddingBottom) || 0,
        "inset left": parseFloat(style.paddingLeft) || 0,
        "inset right": parseFloat(style.paddingRight) || 0,
    };
}

function sample(probe: HTMLDivElement): Sample {
    const map = document.getElementById("gridmap");
    const canvas = map?.querySelector("canvas");
    const vv = window.visualViewport;
    return {
        ...insets(probe),
        "innerHeight": window.innerHeight,
        "innerWidth": window.innerWidth,
        "clientHeight": document.documentElement.clientHeight,
        "vv height": vv ? Math.round(vv.height * 10) / 10 : -1,
        "vv offsetTop": vv ? Math.round(vv.offsetTop * 10) / 10 : -1,
        "vv scale": vv ? Math.round(vv.scale * 100) / 100 : -1,
        "map w": map?.clientWidth ?? -1,
        "map h": map?.clientHeight ?? -1,
        "canvas px h": canvas?.height ?? -1,
        "dpr": window.devicePixelRatio,
    };
}

export default function ViewportDebug() {
    const [enabled, setEnabled] = useState(false);
    const probe = useRef<HTMLDivElement | null>(null);
    const output = useRef<HTMLPreElement | null>(null);
    const stats = useRef<Map<string, Stat>>(new Map());
    const log = useRef<string[]>([]);
    const start = useRef(0);

    useEffect(() => {
        setEnabled(new URLSearchParams(window.location.search).get("debug") === "viewport");
    }, []);

    useEffect(() => {
        if (!enabled) return;
        start.current = performance.now();
        let frame = 0;
        let last = "";

        const tick = () => {
            if (probe.current && output.current) {
                const now = sample(probe.current);
                const changed: string[] = [];

                for (const [key, value] of Object.entries(now)) {
                    const stat = stats.current.get(key);
                    if (!stat) {
                        stats.current.set(key, { now: value, min: value, max: value, changes: 0 });
                    } else if (stat.now !== value) {
                        changed.push(`${key} ${stat.now}→${value}`);
                        stat.now = value;
                        stat.min = Math.min(stat.min, value);
                        stat.max = Math.max(stat.max, value);
                        stat.changes++;
                    }
                }

                if (changed.length) {
                    const t = ((performance.now() - start.current) / 1000).toFixed(1);
                    log.current = [`${t}s ${changed.join(", ")}`, ...log.current].slice(0, LOG_SIZE);
                }

                const rows = [...stats.current].map(([key, s]) =>
                    `${key.padEnd(13)} ${String(s.now).padStart(6)}  ${s.min === s.max ? "" : `${s.min}–${s.max}`}${s.changes ? ` ×${s.changes}` : ""}`);
                const text = [...rows, "", "last changes:", ...(log.current.length ? log.current : ["(none)"])].join("\n");
                if (text !== last) output.current.textContent = last = text;
            }
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [enabled]);

    if (!enabled) return null;

    const reset = () => {
        stats.current.clear();
        log.current = [];
        start.current = performance.now();
    };

    return (
        <>
            <div ref={probe} aria-hidden className="pointer-events-none invisible fixed left-0 top-0"
                 style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}/>
            <pre ref={output} onClick={reset} title="Tap to reset ranges"
                 className="fixed left-2 top-1/3 z-[100] m-0 max-w-[calc(100vw-16px)] overflow-hidden whitespace-pre rounded bg-black/80 p-2 font-mono text-[10px] leading-[1.35] text-white"/>
        </>
    );
}
