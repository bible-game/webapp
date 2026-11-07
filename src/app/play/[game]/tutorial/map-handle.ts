import { Gridmap, type GridmapCameraChange } from "@project-gridmap/library";

/**
 * A handle on the Play page's map for the tutorial and the round's notes, which sit beside the page rather than in it:
 * the map is found in the page (data-play-part="map") and moved and heard through the library's own API
 */

/** The map on the page now */
export function liveMap(): Gridmap | null {
    return Gridmap.from(document.querySelector("[data-game-ready] [data-play-part=map]"));
}

/**
 * Hears each zoom the visitor makes on the map (a pinch, a scroll), not the tutorial's glides or Play's own jumps; it
 * follows the page to a new map when Play makes one. Returns a stop
 */
export function onZoom(heard: () => void): () => void {
    let map: Gridmap | null = null;
    let stop = () => {};
    const attach = () => {
        const now = liveMap();
        if (now === map) return;
        stop();
        map = now;
        stop = now ? now.on("cameraChange", (payload) => {
            const { k, previous, source } = payload as GridmapCameraChange;
            if (source === "user" && Math.abs(k - previous.k) > previous.k * 1e-3) heard();
        }) : () => {};
    };
    attach();
    const watch = new MutationObserver(attach);
    watch.observe(document.body, { childList: true, subtree: true });
    return () => { watch.disconnect(); stop(); };
}

export type Camera = { cx: number; cy: number; k: number };
export const cameraOf = (map: Gridmap): Camera => map.getCamera();

/**
 * Moves the map to a division (a group), a book (an item) or back out to the whole map, smoothly, where focusGroup,
 * focusItem and focusMap jump. `from` starts it from a camera the map has already jumped away from (Play's own jump,
 * when a round ends). Under reduced motion it simply jumps. Returns a cancel
 */
export function glideTo(map: Gridmap, to: { group: string } | { item: string } | { whole: true }, ms = 1000, start?: Camera): () => void {
    const glided = "group" in to ? map.glideTo("group", to.group, { duration: ms, from: start })
        : "item" in to ? map.glideTo("item", to.item, { duration: ms, from: start })
        : map.glideTo("map", undefined, { duration: ms, from: start });
    return glided ? () => { map.cancelGlide(); } : () => {};
}
