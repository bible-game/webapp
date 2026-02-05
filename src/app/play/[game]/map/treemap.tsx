"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from "react-hot-toast";
import { StarMap, bibleToSceneModel, type StarMapConfig, type SceneNode, type StarArrangement, type StarMapHandle, type BibleJSON } from "@project-skymap/library";

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
    const [bookBible, setBookBible] = useState<BibleJSON | null>(null);

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

        fetch("/bible.json")
            .then(res => res.json())
            .then(data => setBookBible(data))
            .catch(err => console.error("Failed to load bible.json:", err));
    }, []);

    // Pre-generate all book colors when bookBible is loaded
    useEffect(() => {
        if (bookBible) {
            bookBible.testaments.forEach(t => 
                t.divisions.forEach(d => 
                    d.books.forEach(b => getBookColor(b.key))
                )
            );
        }
    }, [bookBible]);

    // Enable Order Reveal by default
    useEffect(() => {
        if (mapRef.current?.setOrderRevealEnabled) {
             mapRef.current.setOrderRevealEnabled(true);
        }
    }, [mapRef.current]);

    const config = useMemo<StarMapConfig>(() => {
        if (!arrangement || !groupsConfig || !constellationConfig || !bookBible) {
            return {} as StarMapConfig; // Return an empty config or loading state if data is not ready
        }

        let focusNodeId: string | undefined;

        // The findBookKey logic can be simplified if we rely on bookBible and StarMap's internal hierarchy
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
            const key = findBookKey(props.passage.book, bookBible.testaments); // Use bookBible here
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
            data: bookBible,
            adapter: bibleToSceneModel,
            arrangement: arrangement,
            groups: groupsConfig as any,
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
            fitProjection: true,
            visuals: {
                colorBy: [
                    // Per-book colors (level 3) - using dynamically generated colors
                    ...Object.entries(BOOK_COLORS).map(([key, color]) => ({
                        when: { bookKey: key, level: 3 },
                        value: color
                    })),
                    { when: { level: 0 }, value: "#38bdf8" }, // Testaments
                    { when: { level: 1 }, value: "#a3e635" }, // Divisions
                    { when: { level: 2 }, value: "#ffffff" }, // Books
                ],
                sizeBy: [
                    { when: { level: 3 }, field: "weight", scale: [2.0, 5.0] }
                ]
            },
            layout: { mode: "spherical", radius: 500, chapterRingSpacing: 40, algorithm: "phyllotaxis" },
            focus: {
                nodeId: focusNodeId,
                animate: true
            }
        };
    }, [props.device, props.bookFound, props.divFound, props.testFound, props.passage, constellationConfig, arrangement, groupsConfig, bookBible]);

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
