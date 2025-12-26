"use client"

import React, { useMemo } from 'react';
import { toast } from "react-hot-toast";
import colours from './config/colours.json';
import { StarMap, bibleToSceneModel, type StarMapConfig, type SceneNode } from "@project-skymap/library";

/**
 * StarMap Component for displaying the Bible (replacing FoamTree)
 * @since 1st June 2025
 */
const Treemap = (props: any) => {

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
            camera: { fov: 60, z: 120 },
            data: { testaments: props.data }, // Wrap the data as bibleToSceneModel expects { testaments: [] }
            adapter: bibleToSceneModel,
            visuals: {
                colorBy: [
                    ...colorRules,
                    { when: { level: 0 }, value: "#38bdf8" }, // Fallback for Testaments
                    { when: { level: 1 }, value: "#a3e635" }, // Fallback for Divisions
                    { when: { level: 2 }, value: "#ffffff" }, // Fallback for Books
                ],
                sizeBy: [
                    { when: { level: 3 }, field: "weight", scale: props.device === "mobile" ? [0.5, 1.5] : [0.5, 3.0] }
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
    }, [props.data, props.device, props.bookFound, props.divFound, props.testFound, props.passage]);

    const handleSelect = (node: SceneNode) => {
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

    return (
        <div className="absolute inset-0 w-full h-full z-0 bg-black pointer-events-auto" id="treemap">
             <StarMap
                className="w-full h-full"
                config={config}
                onSelect={handleSelect}
            />
        </div>
    );
};

export default Treemap;
