"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from "react-hot-toast";
import colours from './config/colours.json';
import { StarMap, bibleToSceneModel, type StarMapConfig, type SceneNode, type StarArrangement, type StarMapHandle } from "@project-skymap/library";
import initialArrangement from "./arrangement.json";
import groups from "./groups.json";

/**
 * StarMap Component for displaying the Bible (replacing FoamTree)
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    const [constellationConfig, setConstellationConfig] = useState<any>(null);
    const mapRef = useRef<StarMapHandle>(null);

    useEffect(() => {
        fetch("/constellations.json")
          .then(res => res.json())
          .then(data => setConstellationConfig(data))
          .catch(err => console.error("Failed to load constellations:", err));
    }, []);

    // Enable Order Reveal by default
    useEffect(() => {
        if (mapRef.current?.setOrderRevealEnabled) {
             mapRef.current.setOrderRevealEnabled(true);
        }
    }, [mapRef.current]);

    const config = useMemo<StarMapConfig>(() => {
        // Transform colours.json into StarMap color rules
        const colorRules = Object.entries(colours).map(([key, color]) => ({
            when: { bookKey: key },
            value: color
        }));

        let focusNodeId: string | undefined;

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
            const key = findBookKey(props.passage.book, props.data);
            if (key) focusNodeId = `B:${key}`;
        } else if (props.divFound) {
            focusNodeId = `D:${props.passage.testament}:${props.passage.division}`;
        } else if (props.testFound) {
            focusNodeId = `T:${props.passage.testament}`;
        }

        console.log("StarMap Config update. BookFound:", !!props.bookFound, "FocusID:", focusNodeId);

        return {
            background: "#05060a",
            camera: { fov: 80, z: 120, lon: 275 * Math.PI / 180 },
            data: { testaments: props.data }, // Wrap the data as bibleToSceneModel expects { testaments: [] }
            adapter: bibleToSceneModel,
            arrangement: initialArrangement as unknown as StarArrangement,
            groups: groups as any,
            constellations: constellationConfig,
            showBookLabels: true,
            showDivisionLabels: false,
            showChapterLabels: true,
            showGroupLabels: true,
            showConstellationLines: false,
            showDivisionBoundaries: false,
            showConstellationArt: true,
            showBackdropStars: true,
            backdropStarsCount: 31000,
            showAtmosphere: false,
            visuals: {
                colorBy: [
                    ...colorRules,
                    { when: { level: 0 }, value: "#38bdf8" }, // Fallback for Testaments
                    { when: { level: 1 }, value: "#a3e635" }, // Fallback for Divisions
                    { when: { level: 2 }, value: "#ffffff" }, // Fallback for Books
                ],
                sizeBy: [
                    { when: { level: 3 }, field: "weight", scale: [2.0, 5.0] }
                ]
            },
            layout: { 
                mode: "spherical", 
                radius: 500, 
                chapterRingSpacing: 40 
            },
            focus: {
                nodeId: focusNodeId,
                animate: true
            }
        };
    }, [props.data, props.device, props.bookFound, props.divFound, props.testFound, props.passage, constellationConfig]);

    const handleSelect = (node: SceneNode) => {
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
            />
        </div>
    );
};

export default Treemap;
