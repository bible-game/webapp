"use client"

import React, { useEffect, useRef, useState } from 'react';
import { toast } from "react-hot-toast";
import { hexToHSLA } from "@/core/util/colour-util";
import narrative from './config/narrative.json';
import events from './config/events.json';
import colours from './config/colours.json';
import { renderStar } from "./star-renderer";

/**
 * Voronoi Treemap Component for displaying the Bible
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    //@ts-ignore
    const element = useRef();
    const [ FoamTreeClass, setFoamTreeClass ] = useState();
    const [ foamtreeInstance, setFoamtreeInstance ] = useState();

    const SECTION_ALPHA = 0.1;
    let lastX = 0;
    let lastY = 0;
    let lastNarrativeX = 0;
    let lastNarrativeY = 0;

    useEffect(() => {
        let disposed = false;
        import("@carrotsearch/foamtree").then(module => {
            if (disposed) {
                return;
            }

            if (!disposed) {
                setFoamTreeClass(() => module.FoamTree);
            }
        });

        return () => {
            disposed = true;
        }
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
                groupLabelDarkColor: "#ffffff",
                groupLabelLightColor: "#060842",
                groupLabelColorThreshold: 0,
                parentFillOpacity: 1,
                groupColorDecorator: setupColours,
                descriptionGroupSize: 0,
                groupLabelFontFamily: "inter",

                ...(props.device == 'mobile' ? mobileOptimisations : {}),

                // Roll out in groups
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
                    console.log(e);
                    e.preventDefault();
                },
                onKeyUp: (e: any) => {
                    if (e.keyCode === 27) {
                        e.preventDefault();
                    }
                },
                onTransformEnd: (e: any) => {
                    if (e.touches === 3) {
                        e.preventDefault();
                    }
                },
                groupLabelLayoutDecorator: function (opts: any, props: any, vars: any) {
                    vars.verticalPadding = 0;
                    vars.maxTotalTextHeight = 0.1;
                },

                groupBorderWidth: 0,
                groupBorderRadius: 0,
                groupInsetWidth: 12,
                groupMinDiameter: 0,
                groupStrokeWidth: 0,
                groupStrokeType: 'plain',
                groupFillType: 'gradient',
                stacking: "flattened",
                descriptionGroupType: "stab",
            }));
        }

        if (foamtreeInstance) {
            //@ts-ignore
            foamtreeInstance.set({
                groupContentDecorator: setupContent
            })
        }

        return () => {
            if (foamtreeInstance) {
                //@ts-ignore
                foamtreeInstance.dispose();
                //@ts-ignore
                setFoamtreeInstance(null);
            }
        }
    }, [ FoamTreeClass, foamtreeInstance ]);

    useEffect(() => {
        if (foamtreeInstance && (props.bookFound || props.divFound || props.testFound)) {
            //@ts-ignore
            foamtreeInstance.set({
                groupColorDecorator: updateColours
            });
        }

        //@ts-ignore
        if (props.bookFound) foamtreeInstance.zoom(props.passage.book)
        //@ts-ignore
        else if (props.divFound) foamtreeInstance.zoom(props.passage.division.toLowerCase().replace(/\s/g, '-'))
        //@ts-ignore
        else if (props.testFound) foamtreeInstance.zoom(props.passage.testament.toLowerCase());

        return () => {

        }
    }, [props.bookFound, props.divFound, props.testFound]);

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
            books.push({
                id: b.name,
                label: b.name,
                open: true,
                groups: getChapters(test, div, b, b.chapters),
                weight: getBookWeight(b),
                color: (colours as any)[b.key],
                unselectable: true,
                level: 'book',
                testament: test,
                division: div,
                book: b.name,
            });
        }

        return books;
    }

    function getChapters(test: string, div: string, book: any, ch: number) {
        const chapters: any[] = [];

        for (let c = 1; c <= ch; c++) {
            chapters.push({
                id: book.key + '/' + c.toString(),
                label: c,
                weight: 20,
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

    function getBookWeight(book: any) {
        let weight = 0.0;

        for (const verse of book.verses) {
            weight += 20;
        }

        return weight;
    }

    function getDivisionWeight(division: any) {
        let weight = 0.0;

        for (const book of division.books) {
            weight += getBookWeight(book);
        }

        return weight;
    }

    function getTestamentWeight(testament: any) {
        let weight = 0.0;

        for (const division of testament.divisions) {
            weight += getDivisionWeight(division);
        }

        return weight;
    }

    function getAllEventsInTest(testament: any) {
        const events: any[] = [];

        testament.groups.forEach((div: any) => {
            div.groups.forEach((book: any) => {
                book.groups.forEach((ch: any) => {
                    if (ch.label == '') events.push(ch)
                })
            })
        })

        return events;
    }

    function getAllEventsInDiv(div: any) {
        const events: any[] = [];

        div.groups.forEach((book: any) => {
            book.groups.forEach((ch: any) => {
                if (ch.label == '') events.push(ch)
            })
        })

        return events;
    }

    function getAllEventsInBook(book: any) {
        const events: any[] = [];

        book.groups.forEach((ch: any) => {
            if (ch.label == '') events.push(ch)
        })

        return events;
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

            if (params.group.level === "division") {
                vars.groupColor.a = SECTION_ALPHA;
            } else {
                vars.groupColor.a = 0;
            }
        }
    }

    function setupContent(opts: any, params: any, vars: any) {
        const sign = () => Math.random() < 0.5 ? -1 : 1;
        const x = params.polygonCenterX + sign() * (Math.random() * params.boxWidth / 3);
        const y = params.polygonCenterY + sign() * (Math.random() * params.boxHeight / 3);

        // Chapter Constellations
        if (params.group.level == 'chapter' && params.group.label != '') {
            const group = params.group;
            vars.groupLabelDrawn = false;

            const ctx = params.context;

            if (params.index) {
                let drawn = false;
                params.parent.groups.forEach(function (group: any) {
                    const firstNode = parseInt(params.group.id.split('/')[1]) == 1;
                    const lastNode = parseInt(params.group.id.split('/')[1]) == params.parent.groups.length;
                    if (!firstNode && parseInt(params.group.id.split('/')[1]) + 1 == parseInt(group.id.split('/')[1])) {
                        //@ts-ignore
                        const geom = foamtreeInstance.get("geometry", group);
                        if (geom && lastX && lastY) {
                            ctx.beginPath();
                            ctx.moveTo(lastX, lastY);
                            ctx.lineTo(x, y);
                            ctx.shadowBlur = 0;
                            ctx.strokeStyle = params.group.color+"20";
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
                            ctx.strokeStyle = params.group.color+"20";
                            ctx.lineWidth = 0.05;
                            ctx.stroke();
                            drawn = true;
                        }
                    }
                });
            }

            // Book Name
            if (params.index >= 0 && params.group.level == 'chapter') {
                const ctx = params.context;

                //@ts-ignore
                const geom = foamtreeInstance.get("geometry", params.parent.id);
                if (params.index == 1 && geom) {
                    // ctx.font = props.mobile ? "6px Arial" : "12px Arial";
                    // todo :: increase brightness!
                    ctx.fillStyle = params.group.color + (props.device == 'mobile' ? "50" : "30");
                    ctx.shadowBlur = 0;

                    const txt = params.parent.label
                    ctx.font = Math.floor(geom.boxWidth / txt.split().length) / 8 + "px Verdana"
                    const xOffset = 0.5 * ctx.measureText(txt).width;
                    const yOffset = 0; // 0.5 * ctx.measureText(txt).height;
                    ctx.fillText(txt, geom.polygonCenterX - xOffset, geom.polygonCenterY - yOffset);
                }
            }

            // Stars
            let size = props.device == 'mobile' ? group.verses / 100 : group.verses / 50;
            if (group.verses > 100) size = props.device == 'mobile' ? 1.5 : 3;

            renderStar(ctx, {
                x, y,
                radius: size,
                tint: params.group.color,
            });

            lastX = x;
            lastY = y;

            // Events
            if (params.group.event) { // todo :: move to inside star!?
                const img = new Image;
                img.src = params.group.event;
                ctx.fillStyle = "#040127";
                ctx.globalCompositeOperation = "destination-in"; // fixme?
                img.onload = function () {
                    ctx.globalAlpha = 0.25;
                    params.context.drawImage(img, x + 2 * size, y + 2 * size, 6 * size, 6 * size);
                };
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 1;
            }

            // Chapter Label
            if (params.index >= 0 && params.group.level == 'chapter') {
                const ctx = params.context;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';
                ctx.fillStyle = 'white';

                ctx.font = "1px Arial";
                ctx.fillStyle = params.group.color+"40";
                ctx.shadowBlur = 0;
                ctx.fillText(group.label,x-1,y-2);
            }

            // Narrative
            if (false && (narrative as any)[group.id]) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = group.color;
                ctx.fillStyle = group.color;

                ctx.beginPath();
                ctx.arc(x, y, props.device == 'mobile' ? 2 : 4, 0, 2 * Math.PI);
                ctx.fill();

                // draw connector
                if (lastNarrativeX && lastNarrativeY) {
                    ctx.beginPath();
                    ctx.moveTo(lastNarrativeX, lastNarrativeY);
                    // ctx.quadraticCurveTo((lastNarrativeX + x)/2, (lastY + y)/2, x, y);
                    ctx.lineTo(x, y);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = params.group.color+"40"; // todo :: gradient fill
                    // ctx.setLineDash([1, 1]);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.font = "8px Arial";
                ctx.fillStyle = params.group.color+"40";
                ctx.shadowBlur = 0;
                const lineHeight = 10;
                const lines = (narrative as any)[group.id].split('\n');

                for (let i = 0; i < lines.length; i++)
                    ctx.fillText(lines[i], x + (x < document.getElementsByTagName('canvas')[3].width / 2 ? 15 : -30), y - (lines.length > 1 ? 10 : 0) - (y < document.getElementsByTagName('canvas')[3].height / 2 ? -10 : 10) + (i*lineHeight));

                lastNarrativeX = x
                lastNarrativeY = y
            }

            lastX = x;
            lastY = y;
        }
    }

    function updateColours (opts: any, params: any, vars: any): void {
        if (!params.group.color) return;

        const colour = hexToHSLA(params.group.color);
        vars.groupColor.h = colour.h
        vars.groupColor.l = colour.l
        vars.groupColor.s = colour.s
        let alpha = 0;

        if (props.bookFound) {
            const isBook: boolean =
                (params.group.book == props.passage.book);

            if (isBook && params.group.level == "chapter")
                alpha = SECTION_ALPHA;

        } else if (props.divFound) {
            const isDivision: boolean =
                (params.group.label == props.passage.division);

            if (isDivision)
                alpha = SECTION_ALPHA;

        } else if (props.testFound) {
            const isTestament: boolean =
                (params.group.testament == props.passage.testament);

            if (isTestament && params.group.level == "division")
                alpha = SECTION_ALPHA;
        }

        vars.groupColor.a = alpha
    }

    // FixMe :: how to determine when foamtreeInstance is ready to display? hooks error at present
    // if (!foamtreeInstance) return <Spinner color="primary" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]"/>
    // else
    return (
            //@ts-ignore
            <div ref={element} className="absolute w-full sm:w-[44rem] h-[calc(100%-26rem)] sm:h-[calc(100%-17rem)] left-0 sm:left-[calc(50%-22rem)] top-[10.25rem] sm:top-[7.75rem]" id="treemap"></div>
    );
};

export default Treemap;