"use client"

import React, { useEffect, useRef, useState } from 'react';
import { toast } from "react-hot-toast";
import { hexToHSLA } from "@/core/util/colour-util";
import narrative from './config/narrative.json';
import events from './config/events.json';
import nebula from './config/nebula.json';
import chapterGroups from './config/groups.json';
import colours from './config/colours.json';
import { renderStar } from "./star-renderer";

/**
 * Voronoi Treemap Component for displaying the Bible
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    //@ts-ignore
    const element = useRef();
    const [FoamTreeClass, setFoamTreeClass] = useState<any>();
    const [foamtreeInstance, setFoamtreeInstance] = useState<any>();

    // 0 -> Division, 1 -> Book, 2 -> Group, 3 -> Chapter
    const [zoomLevel, setZoomLevel] = useState(0);
    const [zoomAccum, setZoomAccum] = useState(0);
    const pinchRef = useRef({ base: 1 });
    const CHAPTER_WEIGHT = 20;
    const MIN_LEVEL = 0;
    const MAX_LEVEL = 3;
    const STEP_PINCH = 1.18;
    const DELTA_UNIT = 0.25;
    const THRESHOLDS = props.device == "mobile" ? {
        up:   [0.5, 2.5, 5],
        down: [1.5, 3, 5],
    } : {
        up:   [0.5, 7.5, 10],
        down: [2.5, 7.5, 10],
    };

    const SECTION_ALPHA = 0.1;
    let lastX = 0;
    let lastY = 0;
    let lastNarrativeX = 0;
    let lastNarrativeY = 0;
    let groupPlacement = -1;

    useEffect(() => {
        let disposed = false;
        import("@carrotsearch/foamtree").then(module => {
            if (disposed) return;
            setFoamTreeClass(() => module.FoamTree);
        });
        return () => { disposed = true; }
    }, []);

    useEffect(() => {
        if (FoamTreeClass && !foamtreeInstance) {
            //@ts-ignore
            setFoamtreeInstance(new FoamTreeClass({
                element: element.current,
                dataObject: configure(props.data),
                layoutByWeightOrder: false,
                relaxationInitializer: "treemap",
                descriptionGroupMinHeight: 0,
                descriptionGroupMaxHeight: 0.1,
                groupLabelMinFontSize: 0,
                groupLabelMaxFontSize: 0,
                groupSelectionOutlineWidth: 0,
                rectangleAspectRatioPreference: 0,
                maxGroupLevelsDrawn: 5,
                maxGroupLevelsAttached: 5,
                groupLabelDarkColor: "#ffffff",
                groupLabelLightColor: "#060842",
                groupLabelColorThreshold: 0,
                parentFillOpacity: 1,
                groupContentDecoratorTriggering: "onSurfaceDirty",
                groupColorDecorator: setupColours,
                groupContentDecorator: setupContent,
                descriptionGroupSize: 0,
                groupLabelFontFamily: "inter",

                ...(props.device == 'mobile' ? mobileOptimisations : {}),

                rolloutMethod: "groups",
                onGroupDoubleClick: function (event: any) {
                    event.preventDefault();
                },
                maxLabelSizeForTitleBar: 0,
                onGroupClick: function (event: any) {
                    if (event.group.id.includes('/')) {
                        const selection = event.group.id.split('/');
                        props.select(selection[0], selection[1]);
                        toast.success(`${selection[0]} ${selection[1]}`);
                    } else {
                        //ts-ignore
                        this.open(event.group.id);
                        props.select(event.group.id, null, false);
                        toast.success(`${event.group.id} 1`);
                    }
                },
                openCloseDuration: 1000,
                onViewResetting: function(e: any) {
                    e.preventDefault();
                },
                onKeyUp: (e: any) => {
                    if (e.keyCode === 27) {
                        e.preventDefault();
                    }
                },
                onGroupMouseWheel: (e: any) => {
                    const raw = typeof e.delta === "number" ? e.delta : (e.deltaY ?? 0);
                    const units = raw / DELTA_UNIT;
                    if (units !== 0) accumulate(units);
                },
                onTransformEnd: (e: any) => {
                    if (e.touches === 3) e.preventDefault();
                },
                onGroupTransformStart: (e: any) => {
                    pinchRef.current.base = e.scale ?? 1;
                },
                onGroupTransform: (e: any) => {
                    const currentScale = e.scale ?? 1;
                    const deltaLevels = Math.log(currentScale / pinchRef.current.base) / Math.log(STEP_PINCH);
                    if (deltaLevels !== 0) {
                        accumulate(deltaLevels);
                        pinchRef.current.base = currentScale;
                    }
                },
                groupBorderWidth: 0,
                groupBorderRadius: 0,
                groupInsetWidth: props.device == "mobile" ? 4 : 8,
                groupMinDiameter: 0,
                groupStrokeType: 'plain',
                groupStrokeWidth: 2,
                finalCompleteDrawMaxDuration: props.device == "mobile" ? 100 : 20000,
                wireframeDrawMaxDuration: props.device == "mobile" ? 100 : 20000,
                // todo :: continue to tune for mobile (performance vs smooth draw) ^^
                groupFillType: 'gradient',
                stacking: "flattened",
                descriptionGroupType: "stab",
            }));
        }

        return () => {
            if (foamtreeInstance) {
                //@ts-ignore
                foamtreeInstance.dispose();
                //@ts-ignore
                setFoamtreeInstance(null);
            }
        }
    }, [FoamTreeClass, foamtreeInstance]);

    useEffect(() => {
        if (foamtreeInstance && (props.bookFound || props.divFound || props.testFound)) {
            //@ts-ignore
            foamtreeInstance.set({ groupColorDecorator: updateColours });
        }

        //@ts-ignore
        if (props.bookFound) {
            //@ts-ignore
            foamtreeInstance?.zoom(props.passage.book);
            setZoomLevel(1);
            setZoomAccum(0);
        }
        //@ts-ignore
        else if (props.divFound) {
            //@ts-ignore
            foamtreeInstance?.zoom(props.passage.division.toLowerCase().replace(/\s/g, '-'));
            setZoomLevel(0);
            setZoomAccum(0);
        }
        //@ts-ignore
        else if (props.testFound) {
            //@ts-ignore
            foamtreeInstance?.zoom(props.passage.testament.toLowerCase());
            setZoomLevel(0);
            setZoomAccum(0);
        }
    }, [props.bookFound, props.divFound, props.testFound, foamtreeInstance]);

    useEffect(() => {
        foamtreeInstance?.redraw();
    }, [props.narrativeHidden, foamtreeInstance]); // fixme...

    useEffect(() => {
        foamtreeInstance?.set({ groupContentDecorator: updateContent });
    }, [zoomLevel, foamtreeInstance]);

    function configure(data: any) {
        const testaments: any[] = [];
        for (const test of data) {
            testaments.push({
                id: test.name.toLowerCase(),
                groups: getDivisions(test.name, test.divisions),
                label: test.name,
                open: true,
                color: (colours as any)[test.name.toUpperCase()],
                weight: getTestamentWeight(test),
                unselectable: true,
                level: 'testament'
            })
        }
        return { groups: testaments }
    }

    function getDivisions(test: string, div: any) {
        const divisions: any[] = [];
        for (const d of div) {
            divisions.push({
                id: d.name.toLowerCase().replace(/\s/g, '-'),
                groups: getBooks(test, d.name, d.books),
                label: d.name,
                open: true,
                weight: getDivisionWeight(d),
                color: (colours as any)[d.books[0].key],
                unselectable: true,
                level: 'division',
                testament: test
            })
        }
        return divisions
    }

    function getBooks(test: string, div: string, bk: any) {
        const books: any[] = [];
        for (const b of bk) {
            const obj: any = {
                id: b.name,
                label: b.name,
                open: true,
                groups: getGroups(test, div, b, b.chapters),
                weight: getBookWeight(b),
                color: (colours as any)[b.key],
                unselectable: true,
                level: 'book',
                testament: test,
                division: div,
                book: b.name,
            }

            if ((nebula as any)[b.name.toLowerCase()]) {
                obj['background'] = (nebula as any)[b.name.toLowerCase()];
            }

            books.push(obj);
        }
        return books;
    }

    function getGroups(test: string, div: string, book: any, ch: number) {
        const groups: any[] = [];
        const name = book.name.toLowerCase();
        const groupings = (chapterGroups as any)[name]
        for (const group of groupings) {
            groups.push({
                id: book.key + '/' + group.name,
                label: group.name,
                open: true,
                weight: getGroupWeight(group.start, group.end || ch),
                groups: getChapters(test, div, book, group.start, group.end || ch),
                color: (colours as any)[book.key],
                unselectable: true,
                level: 'group',
                testament: test,
                division: div,
                book: book.name,
                start: group.start,
                end: group.end || ch
            })
        }
        return groups;
    }

    function getChapters(test: string, div: string, book: any, chStart: number, chEnd: number) {
        const chapters: any[] = [];
        for (let c = chStart; c <= chEnd; c++) {
            chapters.push({
                id: book.key + '/' + c.toString(),
                label: c,
                weight: CHAPTER_WEIGHT,
                color: (colours as any)[book.key],
                level: 'chapter',
                chapter: c,
                testament: test,
                division: div,
                book: book.name,
                verses: parseFloat(book.verses[c - 1]),
                event: (events as any)[book.name.toLowerCase() + c] || ''
            })
        }
        return chapters;
    }

    function getGroupWeight(verseStart: number, verseEnd: number) {
        let weight = 0.0;
        for (let i = verseStart; i <= verseEnd; i++) weight += CHAPTER_WEIGHT;
        if (weight < 100) weight = 100;
        return weight;
    }

    function getBookWeight(book: any) {
        let weight = 0.0;
        for (const verse of book.verses) weight += CHAPTER_WEIGHT;
        if (weight < 100) weight = 100;
        return weight;
    }

    function getDivisionWeight(division: any) {
        let weight = 0.0;
        for (const book of division.books) weight += getBookWeight(book);
        return weight;
    }

    function getTestamentWeight(testament: any) {
        let weight = 0.0;
        for (const division of testament.divisions) weight += getDivisionWeight(division);
        return weight;
    }

    const mobileOptimisations = {
        pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        interactionHandler: "hammerjs"
    }

    function setupColours(opts: any, params: any, vars: any): void {
        vars.labelColor = "auto";
        if (params.group.color) {
            const colour = hexToHSLA(params.group.color);
            vars.groupColor.h = colour.h
            vars.groupColor.l = colour.l
            vars.groupColor.s = colour.s
            vars.groupColor.a = (params.group.level === "division") ? SECTION_ALPHA : 0;
        }
    }

    function setupContent(opts: any, params: any, vars: any) {
        const group = params.group;
        const ctx = params.context;

        const hash = hashCode(group.id);
        const offsetX = (hash % 1000) / 1000 - 0.5;
        const offsetY = (hashCode(group.id.split('').reverse().join('')) % 1000) / 1000 - 0.5;

        const x = params.polygonCenterX + offsetX * params.boxWidth / 1.5;
        const y = params.polygonCenterY + offsetY * params.boxHeight / 1.5;

        if (params.group.level == 'chapter') {
            addStars(ctx, group, x, y);
            if (!props.narrativeHidden && (narrative as any)[group.id])
                addNarrative(ctx, group, x, y);
            lastX = x;
            lastY = y;
        }

        if (group.level == 'division') addDivisionLabels(ctx, group)
    }

    function hashCode(s: string): number {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
        return h;
    }

    function updateContent(opts: any, params: any, vars: any) {
        const group = params.group;
        const ctx = params.context;

        const hash = hashCode(group.id);
        const offsetX = (hash % 1000) / 1000 - 0.5;
        const offsetY = (hashCode(group.id.split('').reverse().join('')) % 1000) / 1000 - 0.5;

        const x = params.polygonCenterX + offsetX * params.boxWidth / 1.5;
        const y = params.polygonCenterY + offsetY * params.boxHeight / 1.5;

        vars.groupLabelDrawn = false;

        if (group.level == 'chapter') addStars(ctx, group, x, y);

        if (zoomLevel == 0 && group.level == 'division') addDivisionLabels(ctx, group);
        if (zoomLevel == 1 && group.level == 'book') addBookLabels(ctx, group);
        // if (zoomLevel >= 1 && group.level == 'book') addNebula(ctx, group);
        if (zoomLevel >= 2 && group.level == 'group' && params.parent.level == 'book') addGroupLabels(ctx, group);
        if (zoomLevel == 3 && group.level == 'chapter') addChapterLabels(ctx, group, x, y);
        if (zoomLevel >= 2 && group.level == 'chapter') addConstellations(ctx, group, params.parent, params.index, x, y);

        lastX = x;
        lastY = y;
    }

    function updateColours(opts: any, params: any, vars: any): void {
        if (!params.group.color) return;

        const colour = hexToHSLA(params.group.color);
        vars.groupColor.h = colour.h
        vars.groupColor.l = colour.l
        vars.groupColor.s = colour.s
        let alpha = 0;

        if (props.bookFound) {
            const isBook: boolean = (params.group.book == props.passage.book);
            if (isBook && params.group.level == "chapter") alpha = SECTION_ALPHA;

        } else if (props.divFound) {
            const isDivision: boolean = (params.group.label == props.passage.division);
            if (isDivision) alpha = SECTION_ALPHA;

        } else if (props.testFound) {
            const isTestament: boolean = (params.group.testament == props.passage.testament);
            if (isTestament && params.group.level == "division") alpha = SECTION_ALPHA;
        }

        vars.groupColor.a = alpha
    }

    function addStars(ctx: any, group: any, x: number, y: number): void {
        const size = calcStarRadius(group.verses);
        renderStar(ctx, { x, y, radius: size, tint: group.color });
    }

    function addNebula(ctx: any, group: any): void {
        if (!group.background) return;

        const geom = foamtreeInstance.get("geometry", group);
        if (geom) {
            const img = new Image;
            img.src = group.background;
            ctx.fillStyle = "#040127";
            img.onload = function () {
                ctx.globalAlpha = 0.25;
                ctx.drawImage(img, geom.polygonCenterX, geom.polygonCenterY, geom.boxWidth, geom.boxHeight);
            };
            ctx.globalAlpha = 1;
        }
    }

    function addDivisionLabels(ctx: any, group: any) {
        //@ts-ignore
        const geom = foamtreeInstance.get("geometry", group);
        if (geom) {
            ctx.fillStyle = group.color+"80";
            ctx.shadowBlur = 0;

            const txt = group.label;
            const words = txt.split(' ');

            let lineHeight = Math.floor(geom.boxWidth / (words[1] || words[0]).length);
            if (lineHeight > 24) lineHeight = 24;
            if (props.device == "mobile" && lineHeight > 18) lineHeight = 18;
            ctx.font = lineHeight + "px Verdana";

            words.forEach((word: any, i: any) => {
                const xOffset = 0.5 * ctx.measureText(word).width;
                const y = geom.polygonCenterY + (i - (words.length - 1) / 4) * lineHeight;
                ctx.fillText(word, geom.polygonCenterX - xOffset, y);
            });
        }
    }

    function addBookLabels(ctx: any, group: any) {
        //@ts-ignore
        const geom = foamtreeInstance.get("geometry", group.id);
        if (geom) {
            ctx.fillStyle = group.color + "80";
            ctx.shadowBlur = 0;

            const txt = group.label;
            ctx.font = Math.floor(geom.boxWidth / txt.split().length) / 8 + "px Verdana"
            const xOffset = 0.5 * ctx.measureText(txt).width;
            const yOffset = 0;
            ctx.fillText(txt, geom.polygonCenterX - xOffset, geom.polygonCenterY - yOffset);
        }
    }

    function addGroupLabels(ctx: any, group: any): void {
        //@ts-ignore
        const geom = foamtreeInstance.get("geometry", group.id);
        if (geom) {
            ctx.fillStyle = group.color + "80";
            ctx.shadowBlur = 0;

            const txt: any = group.label;

            let size = Math.floor(geom.boxWidth / txt.split().length) / 20;
            if (size < 1.5) size = 1.5;

            ctx.font = size + "px Verdana"
            const xOffset = (geom.boxWidth * 0.5);
            const yOffset = (geom.boxHeight * 0.5);
            ctx.fillText(txt, geom.polygonCenterX - xOffset, geom.polygonCenterY - yOffset);

            ctx.fillStyle = group.color + "40";
            ctx.shadowBlur = 0;
            ctx.font = (0.75 * size) + "px Verdana";
            const header: any = (group.start == group.end ? `${group.book} ${group.start}` : `${group.book} ${group.start}-${group.end}`);
            ctx.fillText(header, geom.polygonCenterX - xOffset, geom.polygonCenterY - yOffset - (1.25 * size));

            groupPlacement *= -1;
        }
    }

    function addChapterLabels(ctx: any, group: any, x: number, y: number): void {
        ctx.font = "1.5px Arial";
        ctx.fillStyle = group.color+"80";
        ctx.shadowBlur = 0;

        const size = calcStarRadius(group.verses);
        const xOffset = 1.5
        const yOffset = (3 * size);

        let txt = group.label;
        if (group.event) txt += group.event

        ctx.fillText(txt, x - xOffset, y - yOffset);
    }

    function addConstellations(ctx: any, thisGroup: any, parent: any, index: any, x: number, y: number): void {
        if (!index) return;

        let drawn = false;
        parent.groups.forEach(function (group: any) {
            if (parent.groups.length == 1) return;

            const firstNode = parseInt(thisGroup.label) == parent.groups[0].label;
            const lastNode = parseInt(thisGroup.label) == parent.groups[parent.groups.length - 1].label;
            if (!firstNode && parseInt(thisGroup.label) + 1 == parseInt(group.label)) {
                //@ts-ignore
                const geom = foamtreeInstance.get("geometry", group);
                if (geom && lastX && lastY) {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = group.color+"40";
                    ctx.lineWidth = 0.05;
                    ctx.stroke();
                }
            } else if (lastNode) {
                //@ts-ignore
                const geom = foamtreeInstance.get("geometry", group);

                if (!drawn && geom && lastX && lastY) {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = group.color+"40";
                    ctx.lineWidth = 0.05;
                    ctx.stroke();
                    drawn = true;
                }
            }
        });
    }

    function addNarrative(ctx: any, group: any, x: number, y: number): void {
        ctx.shadowBlur = 10;
        ctx.shadowColor = group.color;
        ctx.fillStyle = group.color;

        ctx.beginPath();
        ctx.arc(x, y, props.device == 'mobile' ? 2 : 4, 0, 2 * Math.PI);
        ctx.fill();

        if (lastNarrativeX && lastNarrativeY) {
            ctx.beginPath();
            ctx.moveTo(lastNarrativeX, lastNarrativeY);
            ctx.lineTo(x, y);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = group.color+"40";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.font = "8px Arial";
        ctx.fillStyle = group.color+"40";
        ctx.shadowBlur = 0;
        const lineHeight = 10;
        const lines = (narrative as any)[group.id].split('\n');

        for (let i = 0; i < lines.length; i++)
            ctx.fillText(
                lines[i],
                x + (x < document.getElementsByTagName('canvas')[3].width / 2 ? 15 : -30),
                y - (lines.length > 1 ? 10 : 0) - (y < document.getElementsByTagName('canvas')[3].height / 2 ? -10 : 10) + (i*lineHeight)
            );

        lastNarrativeX = x;
        lastNarrativeY = y;
    }

    const sign = () => Math.random() < 0.5 ? -1 : 1;

    function calcStarRadius(verses: number): number {
        let size = props.device == 'mobile' ? verses / 100 : verses / 50;
        if (verses > 100) size = props.device == 'mobile' ? 1.5 : 3;
        return size;
    }

    function accumulate(delta: number) {
        setZoomAccum((accPrev: number) => {
            let acc = accPrev + delta;
            let levelChanged = false;

            if (acc < 0) acc = 0;

            setZoomLevel((lvlPrev: number) => {
                let lvl = lvlPrev;

                if (delta > 0 && lvl < MAX_LEVEL) {
                    const need = THRESHOLDS.up[lvl];
                    if (acc >= need) {
                        lvl = Math.min(MAX_LEVEL, lvl + 1);
                        acc = 0;
                        levelChanged = true;
                    }
                }

                if (delta < 0 && lvl > MIN_LEVEL) {
                    const need = THRESHOLDS.down[lvl - 1];
                    if (acc <= need) {
                        lvl = Math.max(MIN_LEVEL, lvl - 1);
                        acc = 0;
                        levelChanged = true;
                    }
                }

                // small decay toward zero if we didn’t cross a threshold
                if (!levelChanged) {
                    const cap = 2 * Math.max(
                        THRESHOLDS.up[Math.max(0, Math.min(lvl, THRESHOLDS.up.length - 1))] || 10,
                        THRESHOLDS.down[Math.max(0, Math.min(lvl, THRESHOLDS.down.length - 1))] || 10
                    );
                    if (acc > cap) acc = cap;
                    if (acc < -cap) acc = -cap;
                }

                setZoomAccum(acc);
                return lvl;
            });

            return acc;
        });
    }


    return (
        //@ts-ignore
        <div ref={element} className="sm:absolute w-full sm:w-[44rem] h-[calc(100%-18rem)] sm:h-[calc(100%-16.5rem)] left-0 sm:left-[calc(50%-22rem)] top-[6.5rem] sm:top-[7.5rem]" id="treemap"></div>
    );
};

export default Treemap;
