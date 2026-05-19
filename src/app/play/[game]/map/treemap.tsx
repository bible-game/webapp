"use client"

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "react-hot-toast";
import { StarMap, bibleToSceneModel, type StarMapConfig, type SceneNode, type StarArrangement, type StarMapHandle, type BibleJSON, type HierarchyFilter, type HorizonThemeConfig } from "@project-skymap/library";
import bible from "../../../../../public/bible.json";
import labelColors from "../../../../../public/colours.json";

const BOOK_COLORS: Record<string, string> = {};

// Simple hash-based color generator for books
function getBookColor(bookKey: string) {
    if (BOOK_COLORS[bookKey]) return BOOK_COLORS[bookKey];

    let hash = 0;
    for (let i = 0; i < bookKey.length; i++) {
        hash = bookKey.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    const s = 60 + (Math.abs(hash >> 8) % 30); // 60-90% saturation
    const l = 60 + (Math.abs(hash >> 16) % 20); // 60-80% lightness

    const color = `hsl(${h}, ${s}%, ${l}%)`;
    BOOK_COLORS[bookKey] = color;
    return color;
}


/**
 * StarMap Component for displaying the Bible (replacing FoamTree)
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    const [constellationConfig, setConstellationConfig] = useState<any>(null);
    const [arrangement, setArrangement] = useState<StarArrangement | null>(null);
    const [groupsConfig, setGroupsConfig] = useState<any>(null);
    const [horizonPresetData, setHorizonPresetData] = useState<any>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [currentFov, setCurrentFov] = useState(50);
    const [hierarchyFilter, setHierarchyFilter] = useState<HierarchyFilter | null>(null);
    const [longPressInfo, setLongPressInfo] = useState<{ node: SceneNode | null; x: number; y: number } | null>(null);

    const mapRef = useRef<StarMapHandle>(null);

    useEffect(() => {
        fetch("/constellations.json")
          .then(res => res.json())
          .then(data => setConstellationConfig(data))
          .catch(err => console.error("Failed to load constellations:", err));
        
        fetch("/arrangement.json")
          .then(res => res.json())
          .then(data => setArrangement(data))
          .catch(err => console.error("Failed to load arrangement:", err));
        
        fetch("/groups.json")
          .then(res => res.json())
          .then(data => setGroupsConfig(data))
          .catch(err => console.error("Failed to load groups:", err));

        fetch("/horizons/biblical-presets.v1.json")
          .then(res => res.json())
          .then(data => setHorizonPresetData(data))
          .catch(err => console.error("Failed to load horizons:", err));
    }, []);

    // Enable Order Reveal by default
    useEffect(() => {
        if (mapRef.current?.setOrderRevealEnabled) {
             mapRef.current.setOrderRevealEnabled(true);
        }
        }, [mapRef.current]);

    // Sync Hierarchy Filter
    useEffect(() => {
        mapRef.current?.setHierarchyFilter?.(hierarchyFilter);
    }, [hierarchyFilter]);

    // Update internal hierarchyFilter state when parent prop changes
    useEffect(() => {
        if (props.activeHierarchyFilter) {
            setHierarchyFilter(props.activeHierarchyFilter);
        } else {
            setHierarchyFilter(null); // Clear filter if prop is undefined/null
        }
    }, [props.activeHierarchyFilter]);

    // Fly to node on external trigger (e.g., guess submission)
    useEffect(() => {
        if (props.flyToNodeId) {
            if (mapRef.current) {
                mapRef.current.flyTo(props.flyToNodeId, 10);
            }
        }
    }, [props.flyToNodeId, mapRef.current]);

    const handleLongPress = useCallback((node: SceneNode | null, x: number, y: number) => {
        setLongPressInfo({ node, x, y });
    }, []);
    
        // Pre-generate all book colors (moved inside component)
        bible.testaments.forEach(t =>
            t.divisions.forEach(d =>
                d.books.forEach(b => getBookColor(b.key))
            )
        );

        const selectedHorizonTheme = useMemo(() => {
            if (!horizonPresetData) return undefined;
            const themes = (horizonPresetData.themes ?? []) as HorizonThemeConfig[];
            const defaultId = (horizonPresetData.defaultThemeId ?? "") as string;
            return themes.find(t => t.id === defaultId) || themes[0];
        }, [horizonPresetData]);
    
        const config = useMemo<StarMapConfig>(() => {
        if (!arrangement || !groupsConfig || !constellationConfig) {
            return {} as StarMapConfig; // Return an empty config or loading state if data is not ready
        }

        let initialFocusNodeId: string | undefined;

        // The findBookKey logic can be simplified if we rely on bible and StarMap's internal hierarchy
        // For now, keeping it similar to how it was to maintain existing focus logic
        const findBookKey = (bookName: string, data: any[]) => {
            for (const t of data) {
                for (const d of t.divisions) {
                    for (const b of d.books) {
                        if (b.name === bookName) return b.key;
                    }
                    }
            }
            return null;
        };

        if (props.bookFound) {
            const key = findBookKey(props.passage.book, bible.testaments); // Use imported bible here
            if (key) initialFocusNodeId = `B:${key}`;
        } else if (props.divFound) {
            initialFocusNodeId = `D:${props.passage.testament}:${props.passage.division}`;
        } else if (props.testFound) {
            initialFocusNodeId = `T:${props.passage.testament}`;
        }

        const currentFocusNodeId = selectedNodeId || initialFocusNodeId;

        return {
            background: "#05060a",
            camera: { lon: 275 * Math.PI / 180, lat: 20 * Math.PI / 180 },
            data: bible,
            adapter: bibleToSceneModel,
            arrangement: arrangement,
            groups: groupsConfig as any,
            labelColors: labelColors as Record<string, string>,
            constellations: constellationConfig,
            showBookLabels: true,
            showDivisionLabels: false,
            showChapterLabels: true,
            showGroupLabels: true,
            labelBehavior: {
                overlapPaddingPx: 2,
                reappearDelayMs: 60,
                classes: {
                    chapter: { maxFov: 22, maxOverlapPx: 12 },
                    group: { maxFov: 22, maxOverlapPx: 12 }
                }
            },
            showConstellationLines: false,
            showDivisionBoundaries: false,
            showConstellationArt: true,
            constellationBaseOpacity: 40,
            showBackdropStars: false,
            backdropStarsCount: 5000,
            backdropWideFovGain: 0,
            backdropSizeExponent: 0.2,
            backdropEnergy: 0.2,
            starSizeExponent: 4.0,
            starSizeScale: 6.0,
            starSizeWeightPercentile: 1.0,
            starZoomReveal: false,
            showAtmosphere: false,
            showMoon: false,
            showSunrise: false,
            showMilkyWay: false,
            horizonTheme: selectedHorizonTheme,
            projection: "blended",
            fitProjection: true,

            visuals: {
                colorBy: [
                    // Per-book colors (level 3)
                    ...Object.entries(BOOK_COLORS).map(([key, color]) => ({
                        when: { bookKey: key, level: 3 },
                        value: color
                    })),
                    { when: { level: 0 }, value: "#38bdf8" },
                    { when: { level: 1 }, value: "#a3e635" },
                    { when: { level: 2 }, value: "#ffffff" },
                ],
                sizeBy: [
                    { when: { level: 3 }, field: "weight", scale: [2.0, 5.0] }
                ]
            },
            layout: { mode: "spherical", radius: 500, chapterRingSpacing: 40, algorithm: "phyllotaxis" },
            focus: {
                nodeId: currentFocusNodeId,
                animate: true
            }
        };
    }, [props.device, props.bookFound, props.divFound, props.testFound, props.passage, constellationConfig, arrangement, groupsConfig, selectedHorizonTheme]);

    const handleSelect = (node: SceneNode) => {
        setSelectedNodeId(node.id);
        // Order Reveal Interaction
        if (node && (node.level === 2 || node.level === 3)) {
            const bookId = node.level === 2 ? node.id : node.parent!;
            mapRef.current?.setFocusedBook?.(bookId);
        } else {
            mapRef.current?.setFocusedBook?.(null);
        }

        if (node.level === 3) {
            // Chapter Selection
            // Previous logic: props.select(bookKey, chapter)
            const { bookKey, chapter } = node.meta as { bookKey: string; chapter: number };
            props.select(bookKey, chapter);
            toast.success(`${bookKey} ${chapter}`);
        } else if (node.level === 2) {
            // Book Selection
            // Previous logic: props.select(bookName, null, false)
            const { book } = node.meta as { book: string };
            props.select(book, null, false);
            toast.success(`${book} 1`);
        }
    };

    const handleHover = (node?: SceneNode) => {
        if (node) {
           // Order Reveal Interaction
           if (node.level === 2 || node.level === 3) {
               const bookId = node.level === 2 ? node.id : node.parent!;
               mapRef.current?.setHoveredBook?.(bookId);
           } else if (node.level === 2.5) {
               // Group Label -> get parent book
               mapRef.current?.setHoveredBook?.(node.parent!);
           } else {
               mapRef.current?.setHoveredBook?.(null);
           }
        } else {
            mapRef.current?.setHoveredBook?.(null);
        }
    };

    return (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto" style={{ background: "#05060a" }} id="treemap">
             <StarMap
                ref={mapRef}
                className="w-full h-full"
                config={config}
                onSelect={handleSelect}
                onHover={handleHover}
                onFovChange={setCurrentFov}
                onLongPress={handleLongPress}
            />

            {/* Long-press info popup */}
            {longPressInfo && (
                <div
                    className="long-press-popup"
                    style={{
                        position: 'fixed',
                        left: Math.min(longPressInfo.x, typeof window !== 'undefined' ? window.innerWidth - 220 : 0),
                        top: Math.max(longPressInfo.y - 120, 10),
                        background: 'rgba(10, 15, 25, 0.95)',
                        border: '1px solid #4fa',
                        borderRadius: 8,
                        padding: 12,
                        minWidth: 200,
                        maxWidth: 280,
                        zIndex: 200,
                        color: '#fff',
                        fontSize: 13,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                    onClick={() => setLongPressInfo(null)}
                >
                    {longPressInfo.node ? (
                        <>
                            <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#4fa' }}>
                                {longPressInfo.node.label}
                            </div>
                            {longPressInfo.node.meta && (
                                <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
                                    {(longPressInfo.node.meta as any).testament && (
                                        <div>Testament: {(longPressInfo.node.meta as any).testament}</div>
                                    )}
                                    {(longPressInfo.node.meta as any).division && (
                                        <div>Division: {(longPressInfo.node.meta as any).division}</div>
                                    )}
                                    {(longPressInfo.node.meta as any).book && (
                                        <div>Book: {(longPressInfo.node.meta as any).book}</div>
                                    )}
                                    {(longPressInfo.node.meta as any).chapter && (
                                        <div>Chapter: {(longPressInfo.node.meta as any).chapter}</div>
                                    )}
                                </div>
                            )}
                            <div style={{ fontSize: 10, color: '#666', marginTop: 8 }}>
                                Tap to dismiss
                            </div>
                        </>
                    ) : (
                        <div style={{ color: '#888' }}>No star selected</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Treemap;
