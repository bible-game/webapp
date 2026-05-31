"use client"

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "react-hot-toast";
import {
    StarMap,
    type ConstellationConfig,
    type HierarchyFilter,
    type HorizonThemeConfig,
    type SceneNode,
    type StarArrangement,
    type StarMapConfig,
    type StarMapHandle,
} from "@project-skymap/library";
import labelColors from "../../../../../public/colours.json";
import {
    buildModelFromArrangement,
    buildTriangulatedConstellations,
    getDefaultHorizonTheme,
    optimizeArrangementForVisibility,
} from "./skymap-config";

type FocusConfig = {
    focus?: {
        nodeId?: string | null;
        animate?: boolean;
    };
};

/**
 * StarMap Component for displaying the Bible
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    const [constellationConfig, setConstellationConfig] = useState<ConstellationConfig | null>(null);
    const [arrangement, setArrangement] = useState<StarArrangement | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [currentFov, setCurrentFov] = useState(50);
    const [hierarchyFilter, setHierarchyFilter] = useState<HierarchyFilter | null>(null);
    const [longPressInfo, setLongPressInfo] = useState<{ node: SceneNode | null; x: number; y: number } | null>(null);

    const mapRef = useRef<StarMapHandle>(null);

    useEffect(() => {
        fetch("/constellations.json")
            .then((res) => res.json())
            .then((data) => setConstellationConfig(data))
            .catch((err) => console.error("Failed to load constellations:", err));

        fetch("/arrangement.json")
            .then((res) => res.json())
            .then((data) => setArrangement(data))
            .catch((err) => console.error("Failed to load arrangement:", err));
    }, []);

    useEffect(() => {
        mapRef.current?.setOrderRevealEnabled?.(true);
    }, []);

    useEffect(() => {
        mapRef.current?.setHierarchyFilter?.(hierarchyFilter);
    }, [hierarchyFilter]);

    useEffect(() => {
        if (props.activeHierarchyFilter) {
            setHierarchyFilter(props.activeHierarchyFilter);
            return;
        }
        setHierarchyFilter(null);
    }, [props.activeHierarchyFilter]);

    useEffect(() => {
        if (props.flyToNodeId) {
            mapRef.current?.flyTo(props.flyToNodeId, 10);
        }
    }, [props.flyToNodeId]);

    const handleLongPress = useCallback((node: SceneNode | null, x: number, y: number) => {
        setLongPressInfo({ node, x, y });
    }, []);

    const selectedHorizonTheme = useMemo<HorizonThemeConfig | undefined>(() => getDefaultHorizonTheme(), []);
    const displayArrangement = useMemo(
        () => (arrangement ? optimizeArrangementForVisibility(arrangement, selectedHorizonTheme) : null),
        [arrangement, selectedHorizonTheme],
    );
    const model = useMemo(
        () => (displayArrangement ? buildModelFromArrangement(displayArrangement) : null),
        [displayArrangement],
    );
    const previewConstellationConfig = useMemo(
        () => (
            displayArrangement
                ? buildTriangulatedConstellations(displayArrangement, constellationConfig)
                : constellationConfig
        ),
        [constellationConfig, displayArrangement],
    );

    const config = useMemo<(StarMapConfig & FocusConfig) | null>(() => {
        if (!displayArrangement || !model || !previewConstellationConfig) {
            return null;
        }

        let initialFocusNodeId: string | undefined;

        const findBookKey = (bookName: string, testaments: any[]) => {
            for (const testament of testaments) {
                for (const division of testament.divisions) {
                    for (const book of division.books) {
                        if (book.name === bookName) return book.key;
                    }
                }
            }
            return null;
        };

        if (props.bookFound) {
            const key = findBookKey(props.passage.book, props.data);
            if (key) initialFocusNodeId = `B:${key}`;
        } else if (props.divFound) {
            initialFocusNodeId = `D:${props.passage.testament}:${props.passage.division}`;
        } else if (props.testFound) {
            initialFocusNodeId = `T:${props.passage.testament}`;
        }

        const currentFocusNodeId = selectedNodeId || initialFocusNodeId;

        return {
            background: "#05060a",
            camera: { lon: 42 * Math.PI / 180, lat: 36 * Math.PI / 180 },
            model,
            arrangement: displayArrangement,
            labelColors: labelColors as Record<string, string>,
            constellations: previewConstellationConfig,
            showBookLabels: false,
            showDivisionLabels: false,
            showChapterLabels: true,
            showGroupLabels: false,
            labelBehavior: {
                overlapPaddingPx: 2,
                reappearDelayMs: 60,
                classes: {
                    chapter: { maxFov: 22, maxOverlapPx: 12 },
                },
            },
            showConstellationLines: true,
            constellationLineMode: "focused",
            showDivisionBoundaries: false,
            showConstellationArt: false,
            constellationBaseOpacity: 40,
            showBackdropStars: false,
            showAtmosphere: false,
            showMoon: false,
            showSunrise: false,
            showMilkyWay: false,
            horizonTheme: selectedHorizonTheme,
            projection: "blended",
            fitProjection: true,
            starSizeExponent: 3.4,
            starSizeScale: 1.0,
            starSizeWeightPercentile: 1.0,
            starZoomReveal: false,
            layout: { algorithm: "phyllotaxis", radius: 2000 },
            focus: {
                nodeId: currentFocusNodeId,
                animate: true,
            },
        };
    }, [
        displayArrangement,
        model,
        previewConstellationConfig,
        props.bookFound,
        props.data,
        props.divFound,
        props.passage,
        props.testFound,
        selectedHorizonTheme,
        selectedNodeId,
    ]);

    const handleSelect = (node: SceneNode) => {
        setSelectedNodeId(node.id);
        if (node.level === 2 || node.level === 3) {
            const bookId = node.level === 2 ? node.id : node.parent!;
            mapRef.current?.setFocusedBook?.(bookId);
        } else {
            mapRef.current?.setFocusedBook?.(null);
        }

        if (node.level === 3) {
            const { bookKey, chapter } = node.meta as { bookKey: string; chapter: number };
            props.select(bookKey, chapter);
            toast.success(`${bookKey} ${chapter}`);
        } else if (node.level === 2) {
            const { book } = node.meta as { book: string };
            props.select(book, null, false);
            toast.success(`${book} 1`);
        }
    };

    const handleHover = (node?: SceneNode) => {
        if (node) {
            if (node.level === 2 || node.level === 3) {
                const bookId = node.level === 2 ? node.id : node.parent!;
                mapRef.current?.setHoveredBook?.(bookId);
            } else {
                mapRef.current?.setHoveredBook?.(null);
            }
        } else {
            mapRef.current?.setHoveredBook?.(null);
        }
    };

    return (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto" style={{ background: "#05060a" }} id="treemap">
            {config ? (
                <StarMap
                    ref={mapRef}
                    className="w-full h-full"
                    config={config}
                    onSelect={handleSelect}
                    onHover={handleHover}
                    onFovChange={setCurrentFov}
                    onLongPress={handleLongPress}
                />
            ) : null}

            {longPressInfo ? (
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
                            {longPressInfo.node.meta ? (
                                <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
                                    {(longPressInfo.node.meta as any).testament ? (
                                        <div>Testament: {(longPressInfo.node.meta as any).testament}</div>
                                    ) : null}
                                    {(longPressInfo.node.meta as any).division ? (
                                        <div>Division: {(longPressInfo.node.meta as any).division}</div>
                                    ) : null}
                                    {(longPressInfo.node.meta as any).book ? (
                                        <div>Book: {(longPressInfo.node.meta as any).book}</div>
                                    ) : null}
                                    {(longPressInfo.node.meta as any).chapter ? (
                                        <div>Chapter: {(longPressInfo.node.meta as any).chapter}</div>
                                    ) : null}
                                </div>
                            ) : null}
                            <div style={{ fontSize: 10, color: '#666', marginTop: 8 }}>
                                Tap to dismiss
                            </div>
                        </>
                    ) : (
                        <div style={{ color: '#888' }}>No star selected</div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default Treemap;
