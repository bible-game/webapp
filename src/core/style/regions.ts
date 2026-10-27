import colours from "@/app/play/[game]/map/config/colours.json";
import { playTheme } from "@/core/style/play-theme";

/**
 * Region colours at three strengths, balanced in OKLCH so no region shouts and none recedes: every hue at the same
 * lightness with capped chroma, red a step deeper so it still reads as red (docs/look-and-feel.md, 1.2). The hues follow
 * the logo's (purple to its periwinkle, red to its coral; blue most of the way to its cyan, held at azure so it stays
 * distinct from green on the map).
 * - light (playTheme): text, lines, chips and the emblem; also as a 12% tint and a 50% edge (lit glass)
 * - solid: large fills (the solid region primary, the found tile)
 * - map: the map's outlines and labels, the quietest, because the map is background
 * Glows are the light tier at 25%.
 */
export const REGIONS = ["teal", "purple", "rose", "green", "gold"] as const;
export type Region = typeof REGIONS[number];

export const solid: Record<Region, string> = { teal: "#61c1d7", purple: "#a7aaec", rose: "#da8e83", green: "#7cc499", gold: "#c8af68" };
export const mapTone: Record<Region, string> = { teal: "#6ab1c2", purple: "#9d9fd3", rose: "#c2877e", green: "#7db392", gold: "#b6a36d" };

const regionByLight = Object.fromEntries(REGIONS.map((r) => [playTheme[r], r])) as Record<string, Region>;

/** The region of a light-tier colour (a book's colour in colours.json), if it is one */
export const regionOf = (light?: string): Region | undefined => light ? regionByLight[light.toLowerCase()] : undefined;

/** A light-tier colour at the given strength: 'solid' or 'map', else itself */
export function tone(light: string, tier: "solid" | "map"): string {
    const region = regionOf(light);
    return region ? (tier === "solid" ? solid : mapTone)[region] : light;
}

/** Every book's colour in a tier (keyed like colours.json), for the map */
export function bookColours(tier: "light" | "solid" | "map"): Record<string, string> {
    return Object.fromEntries(Object.entries(colours as Record<string, string>)
        .map(([book, light]) => [book, tier === "light" ? light : tone(light, tier)]));
}

/** A colour at an alpha (0-1), as #rrggbbaa */
export const alpha = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

/** Lit glass: the region's light at 12% fill and 50% edge, text in full light */
export const litGlass = (light: string) => ({ fill: alpha(light, 0.12), edge: alpha(light, 0.5), text: light });

/** The glow under a solid region fill: the light tier at 25%, outside the shape only */
export const glow = (light: string, radius = 14) => `0 0 ${radius}px ${alpha(light, 0.25)}`;
