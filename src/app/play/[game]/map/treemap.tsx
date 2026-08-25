"use client"

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "react-hot-toast";
import {
    getViewModeProfile,
    StarMap,
    type ConstellationConfig,
    type HierarchyFilter,
    type HorizonThemeConfig,
    type PlanetariumViewMode,
    type SceneNode,
    type StarArrangement,
    type StarMapConfig,
    type StarMapHandle,
} from "@project-skymap/library";
import labelColors from "../../../../../public/colours.json";
import {
    buildPreviewHorizonTheme,
    buildModelFromArrangement,
    computeBookRegions,
    computeDivisionRegions,
    divisionTriangulationColor,
    getDefaultHorizonTheme,
    optimizeArrangementForVisibility,
} from "./skymap-config";

type FocusConfig = {
    focus?: {
        nodeId?: string | null;
        animate?: boolean;
    };
};

const SKYMAP_VIEW_MODE: PlanetariumViewMode = "zenith";
const SKYMAP_VIEW_PROFILE = getViewModeProfile(SKYMAP_VIEW_MODE);
export const SKYMAP_MAX_FOV = SKYMAP_VIEW_PROFILE.maxFov;
const ZENITH_HORIZON_TUNING = {
    groundAlpha: 0,
    horizonWarp: 0,
    landscapeOpacity: 0.6,
    landscapeHeight: 5.0,
    landscapeSoftness: 0.4,
};

/**
 * StarMap Component for displaying the Bible
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    const [constellationConfig, setConstellationConfig] = useState<ConstellationConfig | null>(null);
    const [arrangement, setArrangement] = useState<StarArrangement | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [currentFov, setCurrentFov] = useState(SKYMAP_VIEW_PROFILE.defaultFov);
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
    const previewHorizonTheme = useMemo<HorizonThemeConfig | undefined>(
        () => (selectedHorizonTheme ? buildPreviewHorizonTheme(selectedHorizonTheme) : undefined),
        [selectedHorizonTheme],
    );
    const displayArrangement = useMemo(
        () => (arrangement ? optimizeArrangementForVisibility(arrangement, selectedHorizonTheme) : null),
        [arrangement, selectedHorizonTheme],
    );
    const model = useMemo(
        () => (displayArrangement ? buildModelFromArrangement(displayArrangement) : null),
        [displayArrangement],
    );
    const divisionColors = useMemo(() => {
        if (!model) return {};
        const colors: Record<string, string> = {};
        for (const node of model.nodes) {
            if (node.level !== 1) continue;
            const divisionName = (node.meta?.division as string) ?? node.label;
            colors[divisionName] = divisionTriangulationColor(divisionName);
        }
        return colors;
    }, [model]);
    const divisionRegions = useMemo<StarMapConfig["divisionRegions"]>(
        () => (displayArrangement ? computeDivisionRegions(displayArrangement) : undefined),
        [displayArrangement],
    );
    const bookRegions = useMemo<StarMapConfig["bookRegions"]>(
        () => (displayArrangement ? computeBookRegions(displayArrangement) : undefined),
        [displayArrangement],
    );
    const previewConstellationConfig = useMemo(() => {
        if (!constellationConfig) return null;
        const defined = constellationConfig.constellations.filter(
            (constellation) => (constellation.lineSegments?.length ?? 0) > 0 || (constellation.linePaths?.length ?? 0) > 0,
        );
        return { ...constellationConfig, constellations: defined };
    }, [constellationConfig]);

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
            viewMode: SKYMAP_VIEW_MODE,
            camera: { lon: 20 * (Math.PI / 180), lat: 30 * (Math.PI / 180), fov: SKYMAP_VIEW_PROFILE.defaultFov },
            groundCaptionText: props.passage.summary,
            model,
            arrangement: displayArrangement,
            labelColors: labelColors as Record<string, string>,
            divisionColors,
            divisionRegions,
            bookRegions,
            constellations: previewConstellationConfig,
            showBookLabels: true,
            showDivisionLabels: false,
            showChapterLabels: true,
            showDivisionTint: true,
            divisionLabelPushFraction: 0.45,
            divisionLabelHorizonPaddingDeg: 25,
            showGroupLabels: false,
            labelBehavior: {
                overlapPaddingPx: 2,
                reappearDelayMs: 60,
                classes: {
                    division: { minFov: 60, maxFov: 180, priority: 1, fovFadeFeatherDeg: 8 },
                    book: { minFov: 20, maxFov: 70, priority: 2, fovFadeFeatherDeg: 10 },
                    chapter: { minFov: 1, maxFov: 25, priority: 3, maxOverlapPx: 12, fovFadeFeatherDeg: 12 },
                },
            },
            showConstellationLines: false,
            constellationLineMode: "off",
            showDivisionBoundaries: false,
            showConstellationArt: false,
            constellationBaseOpacity: 40,
            showBackdropStars: false,
            showAtmosphere: false,
            showMoon: false,
            showSunrise: false,
            showMilkyWay: false,
            horizonTheme: previewHorizonTheme,
            fitProjection: true,
            zenithHorizonWarp: ZENITH_HORIZON_TUNING.horizonWarp,
            horizonGroundAlpha: ZENITH_HORIZON_TUNING.groundAlpha,
            showLandscapeSilhouette: true,
            landscapeSilhouetteOpacity: ZENITH_HORIZON_TUNING.landscapeOpacity,
            landscapeSilhouetteHeightDeg: ZENITH_HORIZON_TUNING.landscapeHeight,
            landscapeSilhouetteSoftness: ZENITH_HORIZON_TUNING.landscapeSoftness,
            landscapeSilhouetteColor: "#05080d",
            starSizeExponent: 4.0,
            starSizeScale: 1.25,
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
        divisionColors,
        divisionRegions,
        bookRegions,
        model,
        previewConstellationConfig,
        props.bookFound,
        props.data,
        props.divFound,
        props.passage,
        props.testFound,
        previewHorizonTheme,
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
                    onFovChange={(fov: number) => {
                        setCurrentFov(fov);
                        props.onFovChange?.(fov);
                    }}
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
