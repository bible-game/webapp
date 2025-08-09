"use client"

import React, { useEffect, useRef, useState } from 'react';
import hexToRgba from 'hex-to-rgba';
import { toast } from "react-hot-toast";
import { darkenHexColor } from "@/core/util/colour-util";

const mobileOptimisations = {
    pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    // relaxationVisible: false,
    // relaxationQualityThreshold: 5,
    // rolloutDuration: 0,
    // pullbackDuration: 0,
    // finalCompleteDrawMaxDuration: 50,
    // finalIncrementalDrawMaxDuration: 20,
    interactionHandler: "hammerjs"
}

const narrative: any = {
    'GEN/3': 'People rejected\nfrom Eden',
    'EXO/2': 'Israel leaves Egypt',
    '1KI/11': 'Israel is divided',
    'EZR/1': 'The people return\nfrom exile',
    'JER/36': 'God\'s people\nare punished',
    'HAG/2': 'God promises\nsomething\nbetter',
    'MAT/1': 'Jesus is born',
    'MRK/15': 'The death\nof Jesus',
    'JHN/20': 'Jesus\'\nresurrection',
    'ACT/21': 'The church\nbegins to grow',
    'REV/21': 'A New Heaven\n& Earth'
}

const getEventIcon = (book: string, chapter: number): any => {
    const events: any = {
        'genesis1': '/creation.png',
        'genesis3': '/serpent.png',
        'genesis7': '/noah.png',
        'genesis22': '/isaac.png',
        'genesis37': '/slavery.png',
        'exodus7': '/plague.png',
        'exodus13': '/redsea.png',
        'exodus16': '/manna.png',
        'exodus32': '/goldcalf.png',
        'exodus36': '/tabernacle.png',
        'leviticus16': '/atonement.png',
        'numbers13': '/spies.png',
        'numbers17': '/aarons-rod.png',
        'numbers20': '/moses-rock.png',
        'deuteronomy29': '/moab.png',

        'joshua3': '/jordan.png',
        'judges2': '/judges-angel.png',
        '1 samuel16': '/david-anointed.png',
        '1 samuel17': '/david-goliath.png',
        '2 samuel5': '/david.png',
        '1 kings2': '/solomon-king.png',
        '1 kings6': '/temple-one.png',
        '1 kings12': '/divided.png',
        '2 kings17': '/assyria.png',
        '2 kings25': '/babylon-exile.png',
        'ezra6': '/new-temple.png',
        'esther2': '/queen.png',

        'job2': '/friends.png',
        'psalms2': '/coronation.png',
        'ecclesiastes9': '/tuxedo.png',
        'song of songs2': '/lovers.png',

        'isaiah11': '/wolf.png',
        'daniel6': '/lion.png',

        'hosea3': '/abstain.png',
        'joel1': '/famine.png',
        'amos3': '/enemy.png',
        'nahum2': '/downfall.png',

        'luke3': '/baptism.png',
        'luke6': '/sermon.png',
        'luke22': '/last-supper.png',
        'mathew5': '/sermon.png',
        'john2': '/wedding.png',
        'mathew16': '/keys.png',

        'acts2': '/pentecost.png',
        'acts9': '/saul.png',
        'acts15': '/council.png',

        'romans3': '/justice.png',
        '1 corinthians13': '/love.png',
        '2 corinthians5': '/ambassadors.png',
        'galatians5': '/spirit.png',
        'ephesians6': '/armour.png',
        'philippians2': '/humility.png',
        'hebrews6': '/anchor.png',

        'jude1': '/false-teachers.png',

        'revelation5': '/scroll.png',
        'revelation19': '/second-coming.png',
        'revelation21': '/new-creation.png'
    }
    return events[book+chapter];
}

/**
 * Voronoi Treemap Component for displaying the Bible
 * @since 1st June 2025
 */
//@ts-ignore
const Treemap = (props: any) => {
    //@ts-ignore
    const element = useRef();
    const [ FoamTreeClass, setFoamTreeClass ] = useState();
    const [foamtreeInstance, setFoamtreeInstance] = useState();

    const [ divisions, setDivisions ] = useState([] as any[]);
    const [ books, setBooks ] = useState([] as any[]);

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

        setDivisions(getDivKeys());
        setBooks(getBookKeys());

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
                descriptionGroupMinHeight: 64,
                descriptionGroupMaxHeight: 0.125,
                groupLabelMinFontSize: 0,
                groupLabelMaxFontSize: 16,
                groupSelectionOutlineWidth: 0,
                rectangleAspectRatioPreference: 0,
                groupLabelDarkColor: "#ffffff",
                groupLabelLightColor: "#060842",
                groupLabelColorThreshold: 0,
                parentFillOpacity: 0.25,
                groupColorDecorator: function (opts: any, params: any, vars: any) {
                    vars.labelColor = "auto";

                    if (params.group.level === "book" && !!params.group.color) {
                        const darkened = darkenHexColor(params.group.color, 10);
                        const rgba = hexToRgba(darkened).substring(5, 18);
                        const parts = rgba.split(', ');

                        vars.groupColor.r = parts[0];
                        vars.groupColor.g = parts[1];
                        vars.groupColor.b = parts[2];
                        vars.groupColor.a = 0; // 0.75;

                        vars.labelColor = params.group.color;
                        // vars.strokeColour = params.group.color;
                    } else if (params.group.level == "chapter" && !!params.group.color) {
                        const darkened = darkenHexColor(params.group.color, 0);
                        const rgba = hexToRgba(darkened).substring(5, 18);
                        const parts = rgba.split(', '); // fixme...

                        vars.groupColor.r = parts[0];
                        vars.groupColor.g = parts[1];
                        vars.groupColor.b = parts[2];
                        vars.groupColor.a = 0.2; // 0.55;

                    } else {
                        if (params.group.level == 'filler') {
                            vars.groupColor.r = 255;
                            vars.groupColor.g = 255;
                            vars.groupColor.b = 255;
                            vars.groupColor.a = 0.2; // 0.2
                            vars.strokeColour = params.group.color + '40';
                        } else {
                            vars.groupColor = params.group.color;
                        }
                    }

                    if (params.group.level === "book") {
                        vars.labelColor = params.group.color;
                        vars.strokeColour = params.group.color;
                    }
                    if (params.group.level === "chapter") {
                        vars.labelColor = params.group.color + '80';
                        vars.strokeColour = params.group.color + '80';
                    }
                },
                groupLabelFontFamily: "inter",

                ...(props.device == 'mobile' ? mobileOptimisations : {}),

                // Roll out in groups
                rolloutMethod: "groups",
                // rolloutDuration: 0,
                groupLabelDecorator: function (opts: any, params: any, vars: any) {
                    // todo :: msg Stanislaw, could we support?
                    vars.labelTextShadow = {
                        color: params.group.color + "AA", // glow matches group color
                        blur: 10,
                        offsetX: 0,
                        offsetY: 0
                    };
                },
                onRolloutComplete: function () {
                    // this.set("open", { open: false, groups: [...divisions, ...books] });
                    // this.set("open", { open: false, groups: [...books] });

                    if (props.bookFound) {
                        this.open(props.passage.book);
                    }
                },
                onGroupDoubleClick: function (event: any) {
                    event.preventDefault();
                },
                // todo :: make the summary the hovering group name by passing the hovered group up the chain...
                // titleBarDecorator: function(options: any, parameters: any, variables: any) {
                //     variables.titleBarText = parameters.group.book + ' ' + (parameters.index+1);
                // },
                maxLabelSizeForTitleBar: 0,
                // groupContentDecoratorTriggering: "onShapeDirty",
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

                    // const selection = event.group.id.split('/');
                    //
                    // if (props.playing && event.group.id.includes('/')) {
                    //     if (event.group.icon != props.passage.icon) {
                    //         toast.error(`${selection[0]} ${selection[1]} has a different theme ${event.group.icon}`);
                    //
                    //     } else {
                    //         props.select(selection[0], selection[1]);
                    //         toast.success(`${selection[0]} ${selection[1]}`);
                    //     }
                    // } else {
                    //     //ts-ignore
                    //     this.open(event.group.id);
                    //     if (!props.playing) return;
                    //
                    //     let first = null;
                    //     for (const ch of event.group.groups) {
                    //         if (ch.icon == props.passage.icon) {
                    //             first = ch; break;
                    //         }
                    //     }
                    //
                    //     if (first) {
                    //         props.select(event.group.id, first.id.split("/")[1], false);
                    //         toast.success(`${event.group.id} ${first.id.split("/")[1]}`);
                    //     } else {
                    //         if (event.group.level == 'book')
                    //             toast.error(`${event.group.id} has no valid chapters ${props.passage.icon}`);
                    //     }
                    // }
                },
                openCloseDuration: 1000,
                onGroupHover: function (event: any) {
                    // if (event.group) {
                    //     //@ts-ignore
                    //     this.open(event.group.id);
                    // }
                },
                onViewResetting: function(e: any) {
                    console.log(e);
                    e.preventDefault();
                },
                onGroupMouseWheel: function (event: any) {
                    // console.log(event);
                    if (event.delta < 0) {
                        //@ts-ignore
                        // this.set("open", {
                        //     // groups: [...books, ...divisions],
                        //     groups: [...books],
                        //     open: false,
                        //     keepPrevious: true
                        // });
                    }
                    if (event.delta > 0) {
                        // this.open(event.group.id);
                    }
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

                groupBorderWidth: 0,
                groupBorderRadius: 0,
                groupInsetWidth: 0,
                groupMinDiameter: 0,
                // groupStrokeWidth: 4,
                groupStrokeWidth: 0,
                groupStrokeType: 'gradient',
                groupFillType: 'plain',
                // stacking: "flattened",
                // descriptionGroupType: "floating",
                // layout: "ordered"
            }));
        }

        if (foamtreeInstance) {
            //@ts-ignore
            foamtreeInstance.set({
                // fixme :: why did the stroke disappear, msg Stanislaw?? or leave it...
                groupContentDecorator: function (opts: any, params: any, vars: any) {
                    let sign = Math.random() < 0.5 ? -1 : 1;
                    const x = params.polygonCenterX + sign * (Math.random() * params.boxWidth / 3);
                    sign = Math.random() < 0.5 ? -1 : 1;
                    const y = params.polygonCenterY + sign * (Math.random() * params.boxHeight / 3);

                    if (params.group.level == 'chapter' && !!params.group.image && false) {

                        const group = params.group;
                        vars.groupLabelDrawn = false;
                        // Draw image once loaded
                        if (params.group.image) {
                            // If polygon changed, recompute the inscribed rectangle
                            if (params.shapeDirty) {
                                // Compute the rectangle into which we'll render the image
                                //@ts-ignore
                                group.box = FoamTreeClass.geometry.rectangleInPolygon(
                                    params.polygon, params.polygonCenterX, params.polygonCenterY, 1.0, 1.0);
                            }

                            // Draw the image
                            let imageSize = group.box.w;

                            const img = new Image();
                            img.src = params.group.image;
                            img.onload = function () {
                                // Once the image has been loaded,
                                // put it in the group's data object
                                params.context.drawImage(img, group.box.x, group.box.y, imageSize, imageSize);
                            };

                            // if not last, draw line from this to next (stop short...)
                            const ctx = params.context;
                            // parent.groups.filter('').sliceAfterThis[0]
                            let found = false;
                            params.parent.groups.forEach(function (group: any) {
                                if (!found && group && group.label == '' && group.chapter > params.group.chapter) {
                                    //@ts-ignore
                                    // fixme :: msg Stanislaw... how to draw lines? come back when events done...
                                    const geom = foamtreeInstance.get("geometry", group);
                                    // The geometry may be null if the polygon is not visible
                                    if (geom) {
                                        ctx.beginPath();
                                        ctx.moveTo(params.polygonCenterX, params.polygonCenterY);
                                        ctx.lineTo(geom.polygonCenterX, geom.polygonCenterY);
                                        ctx.lineWidth = 1;
                                        ctx.setLineDash([1, 1]);
                                        // ctx.globalAlpha = 0.25;
                                        ctx.stroke();
                                        // if (props.device != 'mobile') ctx.stroke();
                                    }

                                    found = true;
                                }
                            })

                            // Inter-Section Lines
                            //@ts-ignore
                            const thisTestament = foamtreeInstance.get("dataObject").groups.filter((group: any) => group.label == params.group.testament)[0]
                            const thisDivision = thisTestament.groups.filter((group: any) => group.label == params.group.division)[0];
                            const thisBook = thisDivision.groups.filter((group: any) => group.label == params.group.book)[0];
                            const bookEvents = thisBook.groups.filter((group: any) => group.label == '');
                            const lastEvent = bookEvents[bookEvents.length - 1];

                            let firstEvent = undefined;
                            //@ts-ignore
                            const testIndex = foamtreeInstance.get("dataObject").groups.findIndex((group: any) => group.label == params.group.testament)
                            //@ts-ignore
                            const nextTestament = foamtreeInstance.get("dataObject").groups[testIndex + 1];
                            if (nextTestament) {
                                // Draw line if this is last event in this testament, to first event in next?
                                const allEventsInThisTest = getAllEventsInTest(thisTestament);
                                const allEventsInNextTest = getAllEventsInTest(nextTestament);
                                const lastEventInThisTest = allEventsInThisTest[allEventsInThisTest.length - 1];
                                const firstEventInNextTest = allEventsInNextTest[0];
                                if (group.label == '' && group.id == lastEventInThisTest.id && !!firstEventInNextTest) {
                                    //@ts-ignore
                                    const geom = foamtreeInstance.get("geometry", firstEventInNextTest);
                                    // The geometry may be null if the polygon is not visible
                                    if (geom) {
                                        ctx.beginPath();
                                        ctx.moveTo(params.polygonCenterX, params.polygonCenterY);
                                        ctx.lineTo(geom.polygonCenterX, geom.polygonCenterY);
                                        ctx.lineWidth = 1;
                                        ctx.setLineDash([5, 5]);
                                        // ctx.globalAlpha = 0.25;
                                        // ctx.stroke();
                                    }
                                }

                                const divIndex = thisTestament.groups.findIndex((group: any) => group.label == params.group.division);
                                const nextDivision = thisTestament.groups[divIndex + 1];
                                if (nextDivision) {
                                    const allEventsInThisDiv = getAllEventsInDiv(thisDivision);
                                    const allEventsInNextDiv = getAllEventsInDiv(nextDivision);
                                    const lastEventInThisDiv = allEventsInThisDiv[allEventsInThisDiv.length - 1];
                                    const firstEventInNextDiv = allEventsInNextDiv[0];
                                    if (group.label == '' && group.id == lastEventInThisDiv.id && !!firstEventInNextDiv) {
                                        //@ts-ignore
                                        const geom = foamtreeInstance.get("geometry", firstEventInNextDiv);
                                        // The geometry may be null if the polygon is not visible
                                        if (geom) {
                                            ctx.beginPath();
                                            ctx.moveTo(params.polygonCenterX, params.polygonCenterY);
                                            ctx.lineTo(geom.polygonCenterX, geom.polygonCenterY);
                                            ctx.lineWidth = 1;
                                            const gradient = ctx.createLinearGradient(
                                                params.polygonCenterX * 0.5,
                                                params.polygonCenterY * 0.5,
                                                geom.polygonCenterX * 0.5,
                                                geom.polygonCenterY * 0.5);
                                            gradient.addColorStop(0, group.color);
                                            gradient.addColorStop(1, firstEventInNextDiv.color);
                                            ctx.strokeStyle = gradient;
                                            ctx.setLineDash([5, 5]);
                                            // ctx.globalAlpha = 0.25;
                                            // ctx.stroke();
                                        }
                                    }

                                    const bkIndex = thisDivision.groups.findIndex((group: any) => group.label == params.group.book);
                                    const nextBook = thisDivision.groups[bkIndex + 1];
                                    if (nextBook) {
                                        const allEventsInThisBook = getAllEventsInBook(thisBook);
                                        const allEventsInNextBook = getAllEventsInBook(nextBook);
                                        const lastEventInThisBook = allEventsInThisBook[allEventsInThisBook.length - 1];
                                        const firstEventInNextBook = allEventsInNextBook[0];
                                        if (group.label == '' && group.id == lastEventInThisBook.id && !!firstEventInNextBook) {
                                            //@ts-ignore
                                            const geom = foamtreeInstance.get("geometry", firstEventInNextBook);
                                            // The geometry may be null if the polygon is not visible
                                            if (geom) {
                                                ctx.beginPath();
                                                ctx.moveTo(params.polygonCenterX, params.polygonCenterY);
                                                ctx.lineTo(geom.polygonCenterX, geom.polygonCenterY);
                                                ctx.lineWidth = 1;
                                                // ctx.setLineDash([5, 5]);
                                                // ctx.globalAlpha = 0.25;
                                                // if (props.device != 'mobile') ctx.stroke();
                                            }
                                        }
                                    }
                                }

                            } else {
                                const divIndex = thisTestament.groups.findIndex((group: any) => group.label == params.group.division);
                                const nextDivision = thisTestament.groups[divIndex + 1];
                                if (nextDivision) {
                                    const allEventsInThisDiv = getAllEventsInDiv(thisDivision);
                                    const allEventsInNextDiv = getAllEventsInDiv(nextDivision);
                                    const lastEventInThisDiv = allEventsInThisDiv[allEventsInThisDiv.length - 1];
                                    const firstEventInNextDiv = allEventsInNextDiv[0];
                                    if (group.label == '' && group.id == lastEventInThisDiv.id && !!firstEventInNextDiv) {
                                        //@ts-ignore
                                        const geom = foamtreeInstance.get("geometry", firstEventInNextDiv);
                                        // The geometry may be null if the polygon is not visible
                                        if (geom) {
                                            ctx.beginPath();
                                            ctx.moveTo(params.polygonCenterX, params.polygonCenterY);
                                            ctx.lineTo(geom.polygonCenterX, geom.polygonCenterY);
                                            ctx.lineWidth = 1;
                                            const gradient = ctx.createLinearGradient(
                                                params.polygonCenterX * 0.95,
                                                params.polygonCenterY * 0.95,
                                                geom.polygonCenterX * 0.95,
                                                geom.polygonCenterY * 0.95);
                                            gradient.addColorStop(0, group.color);
                                            gradient.addColorStop(1, firstEventInNextDiv.color);
                                            ctx.strokeStyle = gradient;
                                            // ctx.globalAlpha = 0.25;
                                            // ctx.setLineDash([5, 5]);
                                            // ctx.stroke();
                                        }
                                    }

                                    const bkIndex = thisDivision.groups.findIndex((group: any) => group.label == params.group.book);
                                    const nextBook = thisDivision.groups[bkIndex + 1];
                                    if (nextBook) {
                                        const allEventsInThisBook = getAllEventsInBook(thisBook);
                                        const allEventsInNextBook = getAllEventsInBook(nextBook);
                                        const lastEventInThisBook = allEventsInThisBook[allEventsInThisBook.length - 1];
                                        const firstEventInNextBook = allEventsInNextBook[0];
                                        if (group.label == '' && group.id == lastEventInThisBook.id && !!firstEventInNextBook) {
                                            //@ts-ignore
                                            const geom = foamtreeInstance.get("geometry", firstEventInNextBook);
                                            // The geometry may be null if the polygon is not visible
                                            if (geom) {
                                                ctx.beginPath();
                                                ctx.moveTo(params.polygonCenterX, params.polygonCenterY);
                                                ctx.lineTo(geom.polygonCenterX, geom.polygonCenterY);
                                                ctx.lineWidth = 1;
                                                // ctx.setLineDash([5, 5]);
                                                // ctx.globalAlpha = 0.25;
                                                // if (props.device != 'mobile') ctx.stroke();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else if (params.group.level == 'chapter' && params.group.label != '') {
                        const group = params.group;
                        vars.groupLabelDrawn = false;

                        const ctx = params.context;

                        if (params.index && params.group.level != 'filler') {
                            params.parent.groups.forEach(function (group: any) {
                                const lastNode = parseInt(params.group.id.split('/')[1]) == params.parent.groups.length;
                                if (parseInt(params.group.id.split('/')[1]) + 1 == parseInt(group.id.split('/')[1])) {
                                    //@ts-ignore
                                    const geom = foamtreeInstance.get("geometry", group);
                                    if (geom && lastX && lastY) {
                                        ctx.beginPath();
                                        ctx.moveTo(lastX, lastY);
                                        ctx.lineTo(x, y);
                                        ctx.shadowBlur = 0;
                                        ctx.strokeStyle = params.group.color+"40";
                                        ctx.setLineDash([1, 1]);
                                        ctx.lineWidth = 0.1;
                                        ctx.stroke();
                                    }
                                } else if (lastNode) {
                                    //@ts-ignore
                                    const geom = foamtreeInstance.get("geometry", group);
                                    if (geom && lastX && lastY) {
                                        ctx.globalAlpha = 0.1; // fixme...
                                        ctx.beginPath();
                                        ctx.moveTo(lastX, lastY);
                                        ctx.lineTo(x, y);
                                        ctx.shadowBlur = 0;
                                        ctx.setLineDash([1, 1]);
                                        ctx.lineWidth = 0.1;
                                        ctx.stroke();
                                        ctx.globalAlpha = 1;
                                    }
                                }
                            });
                        }

                        let size = group.weight / 50;
                        if (size > 3) size = 3;

                        ctx.shadowBlur = 10;
                        ctx.shadowColor = 'white';
                        ctx.fillStyle = 'white';

                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, 2 * Math.PI);
                        ctx.fill();

                        lastX = x;
                        lastY = y;

                        if (params.group.event) {
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

                        if (params.index >= 0 && params.group.level == 'chapter') {
                            const ctx = params.context;
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = 'white';
                            ctx.fillStyle = 'white';

                            ctx.font = "1.5px Arial";
                            ctx.fillStyle = params.group.color+"40";
                            ctx.shadowBlur = 0;
                            // ctx.fillText(params.parent.label + group.label,x-9,y-4);
                            ctx.fillText(group.label,x-1,y-2);

                            // if (params.index == Math.floor(params.parent.groups.length / 4)) {
                            if (params.index == 1) {
                                ctx.font = "4px Arial";
                                ctx.fillStyle = params.group.color+"20";
                                ctx.shadowBlur = 0;
                                ctx.fillText(params.parent.label,params.polygonCenterX,params.polygonCenterY);
                            }
                            // if (params.index == 1) {
                            //     ctx.font = "8px Arial";
                            //     ctx.fillStyle = params.group.color+"40";
                            //     ctx.shadowBlur = 0;
                            //     ctx.fillText(params.group.division,params.polygonCenterX-10,params.polygonCenterY+10);
                            // }
                        }

                        if (narrative[group.id]) {
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = group.color;
                            ctx.fillStyle = group.color;

                            ctx.beginPath();
                            ctx.arc(x, y, props.device == 'mobile' ? 3 : 5, 0, 2 * Math.PI);
                            ctx.fill();

                            // draw connector
                            if (lastNarrativeX && lastNarrativeY) {
                                ctx.beginPath();
                                ctx.moveTo(lastNarrativeX, lastNarrativeY);
                                ctx.lineTo(x, y);
                                ctx.shadowBlur = 0;
                                ctx.strokeStyle = params.group.color+"40"; // todo :: gradient fill
                                ctx.setLineDash([1, 1]);
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }

                            ctx.font = "8px Arial";
                            ctx.fillStyle = params.group.color+"80";
                            ctx.shadowBlur = 0;
                            const lineHeight = 10;
                            const lines = narrative[group.id].split('\n');

                            for (let i = 0; i < lines.length; i++)
                                ctx.fillText(lines[i], x + (x < document.getElementsByTagName('canvas')[3].width / 2 ? 15 : -70), y - (lines.length > 1 ? 10 : 0) - (y < document.getElementsByTagName('canvas')[3].height / 2 ? -10 : 20) + (i*lineHeight));

                            lastNarrativeX = x
                            lastNarrativeY = y
                        }

                        lastX = x;
                        lastY = y;
                    }

                    // if (params.group.level == 'book' && !!params.group.image) {
                    //     const group = params.group;
                    //     vars.groupLabelDrawn = true; // fixme
                    //     // Draw image once loaded
                    //     if (params.group.image) {
                    //         // If polygon changed, recompute the inscribed rectangle
                    //         if (params.shapeDirty) {
                    //             // Compute the rectangle into which we'll render the image
                    //             if (params.group.label == 'Genesis') console.log(params.group.weight);
                    //             const big = params.group.weight > 750;
                    //             //@ts-ignore
                    //             group.box = FoamTreeClass.geometry.rectangleInPolygon(
                    //                 params.polygon, params.polygonCenterX, params.polygonCenterY, big ? 0.35 : 0.50, 0.75);
                    //         }
                    //
                    //         // Draw the image
                    //         let imageSize = group.box.w;
                    //
                    //         const img = new Image();
                    //         img.src = '/deuteronomy.png'// params.group.image;
                    //         img.onload = function () {
                    //             // Once the image has been loaded,
                    //             // put it in the group's data object
                    //             params.context.drawImage(img, group.box.x, group.box.y, imageSize, imageSize);
                    //         };
                    //     }
                    // }
                }
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
                groupColorDecorator: function(opts: any, params: any, vars: any) {

                    if (props.bookFound) {
                        if (params.group.level == "chapter" && !!params.group.color ) {
                            if (params.group.book == props.passage.book) {
                                // vars.groupColor = params.group.color;
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.3;

                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0;
                                vars.labelColor = params.group.color + '40';
                            }
                        } else if (params.group.level == "book" && !!params.group.color ) {
                            if (params.group.label == props.passage.book) {
                                const darkened = darkenHexColor(params.group.color, 90); // 20% darker
                                const rgba = hexToRgba(darkened).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = (params.group.level == "book" ? 0.75 : 0.55);
                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0;
                                vars.labelColor = params.group.color + '40';
                            }
                        } else {
                            if (params.group.level == 'filler') {
                                vars.groupColor.r = 255;
                                vars.groupColor.g = 255;
                                vars.groupColor.b = 255;
                                vars.groupColor.a = params.group.book == props.passage.book ? 0 : 0;
                                vars.strokeColour = params.group.color + '40';
                            } else {
                                vars.groupColor = params.group.color;
                            }
                        }
                    } else if (props.divFound) {
                        if (params.group.level == "chapter" && !!params.group.color) {
                            if (params.group.division == props.passage.division) {
                                // vars.groupColor = params.group.color;
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.3;

                            } else {
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0;
                                vars.labelColor = params.group.color + '40';
                            }
                        } else if (params.group.level == "book" && !!params.group.color ) {
                            if (params.group.division == props.passage.division) {
                                const darkened = darkenHexColor(params.group.color, 90); // 20% darker
                                const rgba = hexToRgba(darkened).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = (params.group.level == "book" ? 0.75 : 0.55);

                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0;
                                vars.labelColor = params.group.color + '40';
                            }
                        } else {
                            if (params.group.level == 'filler') {
                                vars.groupColor.r = 255;
                                vars.groupColor.g = 255;
                                vars.groupColor.b = 255;
                                vars.groupColor.a = params.group.division == props.passage.division ? 0.3 : 0;
                                vars.strokeColour = params.group.color + '40';
                            } else {
                                vars.groupColor = params.group.color;
                            }
                        }
                    } else if (props.testFound) {
                        if (params.group.level == "chapter" && !!params.group.color) {
                            if (params.group.testament == props.passage.testament) {
                                // vars.groupColor = params.group.color;
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.3;

                            } else {
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0;
                                vars.labelColor = params.group.color + '40';
                            }
                        } else if (params.group.level == "book" && !!params.group.color ) {
                            if (params.group.testament == props.passage.testament) {
                                const darkened = darkenHexColor(params.group.color, 90); // 20% darker
                                const rgba = hexToRgba(darkened).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = (params.group.level == "book" ? 0.75 : 0.55);
                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0;
                                vars.labelColor = params.group.color + '40';
                            }
                        } else {
                            if (params.group.level == 'filler') {
                                vars.groupColor.r = 255;
                                vars.groupColor.g = 255;
                                vars.groupColor.b = 255;
                                vars.groupColor.a = params.group.testament == props.passage.testament ? 0.3 : 0;
                                vars.strokeColour = params.group.color + '00';
                            } else {
                                vars.groupColor = params.group.color;
                            }
                        }
                    }
                }
        });
        }

        // question :: alt to zoom?
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
                colour: getColour(test.name.toUpperCase()),
                weight: getTestamentWeight(test),
                unselectable: true,
                dim: isDim(test.name, 'testament', props.testFound),
                level: 'testament'
            })
        }

        // return { groups: [getPaddingGroups(), ...testaments, getPaddingGroups()] }
        return { groups: testaments }
    }

    function getDivisions(test: string, div: any) {
        const divisions: any[] = [];

        for (const d of div) {
            // divisions.push(...getPaddingGroups(d.name.toLowerCase().replace(/\s/g, '-'), true))
            divisions.push({
                id: d.name.toLowerCase().replace(/\s/g, '-'),
                groups: getBooks(test, d.name, d.books),
                label: d.name,
                open: true,
                weight: getDivisionWeight(d),
                color: getColour(d.books[0].key),
                unselectable: true,
                dim: isDim(d.name, 'division', props.divFound) || isDim(test, 'testament', props.testFound),
                level: 'division',
                testament: test
            })
            // divisions.push(...getPaddingGroups(d.name.toLowerCase().replace(/\s/g, '-'), false))
        }

        return divisions
    }

    function getBooks(test: string, div: string, bk: any) {
        const books: any[] = [];

        for (const b of bk) {
            books.push(...getPaddingGroups(test, div, b.name))
            books.push({
                id: b.name,
                label: b.name,
                open: true,
                groups: getChapters(test, div, b, b.chapters),
                weight: getBookWeight(b),
                color: getColour(b.key),
                unselectable: true,
                dim: isDim(b.name, 'book', props.bookFound),
                level: 'book',
                testament: test,
                division: div,
                book: b.name,
                // image: '/'+b.name.toLowerCase()+'.png'
            });
            books.push(...getPaddingGroups(test, div, b.name))
        }

        return books
    }

    function getChapters(test: string, div: string, book: any, ch: number) {
        const chapters: any[] = [];

        for (let c = 1; c <= ch; c++) {
            chapters.push({
                id: book.key+'/'+c.toString(),
                label: c,
                // label: props.passage.icon == book.icons[c-1] ? c : '',
                weight: parseFloat(book.verses[c-1]),
                color: getColour(book.key),
                dim: isDim(book.name, 'book', props.bookFound),
                level: 'chapter',
                chapter: c,
                // icon: book.icons[c-1],
                testament: test,
                division: div,
                book: book.name,
                event: getEventIcon(book.name.toLowerCase(), c) || ''
            })

            // if (book.name.toLowerCase() == 'genesis' && c == 3) {
            //     chapters.push({
            //         id: 'serpent',
            //         label: '',
            //         weight: parseFloat(book.verses[c-1]),
            //         color: getColour(book.key),
            //         dim: isDim(book.name, 'book', props.bookFound),
            //         level: 'chapter',
            //         chapter: c,
            //         unselectable: false,
            //         testament: test,
            //         division: div,
            //         book: book.name,
            //         image: '/serpent.png'
            //     })
            // }
            // if (book.name.toLowerCase() == 'genesis' && c == 1) {
            //     chapters.push({
            //         id: 'creation',
            //         label: '',
            //         weight: parseFloat(book.verses[c-1]),
            //         color: getColour(book.key),
            //         dim: isDim(book.name, 'book', props.bookFound),
            //         level: 'chapter',
            //         chapter: c,
            //         unselectable: false,
            //         testament: test,
            //         division: div,
            //         book: book.name,
            //         image: '/creation.png'
            //     })
            // }
            // if (book.name.toLowerCase() == 'genesis' && c == 7) {
            //     chapters.push({
            //         id: 'noah',
            //         label: '',
            //         weight: parseFloat(book.verses[c-1]),
            //         color: getColour(book.key),
            //         dim: isDim(book.name, 'book', props.bookFound),
            //         level: 'chapter',
            //         chapter: c,
            //         unselectable: false,
            //         testament: test,
            //         division: div,
            //         book: book.name,
            //         image: '/noah.png'
            //     })
            // }
            // if (book.name.toLowerCase() == 'genesis' && c == 22) {
            //     chapters.push({
            //         id: 'isaac',
            //         label: '',
            //         weight: parseFloat(book.verses[c-1]),
            //         color: getColour(book.key),
            //         dim: isDim(book.name, 'book', props.bookFound),
            //         level: 'chapter',
            //         chapter: c,
            //         unselectable: false,
            //         testament: test,
            //         division: div,
            //         book: book.name,
            //         image: '/isaac.png'
            //     })
            // }
            // if (book.name.toLowerCase() == 'genesis' && c == 37) {
            //     chapters.push({
            //         id: 'slavery',
            //         label: '',
            //         weight: parseFloat(book.verses[c-1]),
            //         color: getColour(book.key),
            //         dim: isDim(book.name, 'book', props.bookFound),
            //         level: 'chapter',
            //         chapter: c,
            //         unselectable: false,
            //         testament: test,
            //         division: div,
            //         book: book.name,
            //         image: '/slavery.png'
            //     })
            // }
            // if (book.name.toLowerCase() == 'exodus' && c == 3) chapters.push({id: 'bush', image: '/bush.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'exodus' && c == 7) chapters.push({id: 'plague', image: '/plague.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'exodus' && c == 13) chapters.push({id: 'redsea', image: '/redsea.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'exodus' && c == 16) chapters.push({id: 'manna', image: '/manna.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'exodus' && c == 32) chapters.push({id: 'goldcalf', image: '/goldcalf.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'exodus' && c == 36) chapters.push({id: 'tabernacle', image: '/tabernacle.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'leviticus' && c == 16) chapters.push({id: 'atonement', image: '/atonement.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'numbers' && c == 13) chapters.push({id: 'spies', image: '/spies.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'numbers' && c == 17) chapters.push({id: 'aarons-rod', image: '/aarons-rod.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'numbers' && c == 20) chapters.push({id: 'moses-rock', image: '/moses-rock.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'deuteronomy' && c == 29) chapters.push({id: 'moab', image: '/moab.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'joshua' && c == 3) chapters.push({id: 'jordan', image: '/jordan.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'judges' && c == 2) chapters.push({id: 'judges-angel', image: '/judges-angel.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '1 samuel' && c == 16) chapters.push({id: 'david-anointed', image: '/david-anointed.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '1 samuel' && c == 17) chapters.push({id: 'david-goliath', image: '/david-goliath.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '2 samuel' && c == 5) chapters.push({id: 'david', image: '/david.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '1 kings' && c == 2) chapters.push({id: 'solomon-king', image: '/solomon-king.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '1 kings' && c == 6) chapters.push({id: 'temple-one', image: '/temple-one.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '1 kings' && c == 12) chapters.push({id: 'divided', image: '/divided.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '2 kings' && c == 17) chapters.push({id: 'assyria', image: '/assyria.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '2 kings' && c == 25) chapters.push({id: 'babylon-exile', image: '/babylon-exile.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'ezra' && c == 6) chapters.push({id: 'new-temple', image: '/new-temple.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'esther' && c == 2) chapters.push({id: 'queen', image: '/queen.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'job' && c == 2) chapters.push({id: 'friends', image: '/friends.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'psalms' && c == 2) chapters.push({id: 'coronation', image: '/coronation.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'ecclesiastes' && c == 9) chapters.push({id: 'tuxedo', image: '/tuxedo.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'song of songs' && c == 2) chapters.push({id: 'lovers', image: '/lovers.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'isaiah' && c == 11) chapters.push({id: 'wolf', image: '/wolf.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'daniel' && c == 6) chapters.push({id: 'lion', image: '/lion.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'hosea' && c == 3) chapters.push({id: 'abstain', image: '/abstain.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'joel' && c == 1) chapters.push({id: 'famine', image: '/famine.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'amos' && c == 3) chapters.push({id: 'enemy', image: '/enemy.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'nahum' && c == 2) chapters.push({id: 'downfall', image: '/downfall.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'luke' && c == 3) chapters.push({id: 'baptism', image: '/baptism.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'luke' && c == 6) chapters.push({id: 'sermon', image: '/sermon.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'luke' && c == 22) chapters.push({id: 'last-supper', image: '/last-supper.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'mathew' && c == 5) chapters.push({id: 'sermon', image: '/sermon.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'john' && c == 2) chapters.push({id: 'wedding', image: '/wedding.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'mathew' && c == 16) chapters.push({id: 'keys', image: '/keys.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'acts' && c == 2) chapters.push({id: 'pentecost', image: '/pentecost.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'acts' && c == 9) chapters.push({id: 'saul', image: '/saul.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'acts' && c == 15) chapters.push({id: 'council', image: '/council.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'romans' && c == 3) chapters.push({id: 'justice', image: '/justice.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '1 corinthians' && c == 13) chapters.push({id: 'love', image: '/love.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == '2 corinthians' && c == 5) chapters.push({id: 'ambassadors', image: '/ambassadors.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // // fixme...
            // if (book.name.toLowerCase() == 'galations' && c == 5) chapters.push({id: 'spirit', image: '/spirit.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'ephesians' && c == 6) chapters.push({id: 'armour', image: '/armour.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'philippians' && c == 2) chapters.push({id: 'humility', image: '/humility.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'hebrews' && c == 6) chapters.push({id: 'anchor', image: '/anchor.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'jude' && c == 1) chapters.push({id: 'false-teachers', image: '/false-teachers.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            //
            // if (book.name.toLowerCase() == 'revelation' && c == 5) chapters.push({id: 'scroll', image: '/scroll.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'revelation' && c == 19) chapters.push({id: 'second-coming', image: '/second-coming.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
            // if (book.name.toLowerCase() == 'revelation' && c == 21) chapters.push({id: 'new-creation', image: '/new-creation.png', label: '', weight: parseFloat(book.verses[c-1]), color: getColour(book.key), dim: isDim(book.name, 'book', props.bookFound), level: 'chapter', chapter: c, unselectable: false, testament: test, division: div, book: book.name,})
        }

        return chapters
    }

    function getBookWeight(book: any) {
        let weight = 0.0;

        for (const verse of book.verses) {
            weight += verse;
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

    function getDivKeys(): any[] {
        const div = [];

        for (const test of props.data) {
            for (const d of test.divisions) {
                div.push(d.name.toLowerCase().replace(/\s/g, '-'))
            }
        }

        return div;
    }

    function getBookKeys(): any[] {
        const book = [];

        for (const test of props.data) {
            for (const d of test.divisions) {
                for (const bk of d.books) {
                    book.push(bk.name)
                    // book.push(bk.key)

                    if (bk.name == props.passage.book) {
                        props.passage.bookKey = bk.key
                    }
                }
            }
        }

        return book;
    }

    const isDim = (name: string, level: string, found: boolean) => {
        if (found) {
            return name != props.passage[level];
        }
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

    // function getPaddingGroups(book: string = '', before: boolean = false): any[] {
    function getPaddingGroups(test: string, div: string, bk: string): any[] {
        const fillers = [] as any[];
        // if (props.device == 'mobile' || true) return fillers;
        // if (props.device == 'mobile') return fillers;

        // const sides = ['top', 'bottom', 'left', 'right'];
        const sides = ['top', 'bottom'];
        let count: number = 1;

        // switch (book) {
        //     case '!genesis':
        //         count = before ? 20 : 20; break;
        //     default:
        //         count = 1;
        // }

        for (const side of sides) {
            for (let i = 0; i < count; i++) {
                fillers.push({
                    id: `filler-${side}-${i}`,
                    label: '',
                    weight: 0.001,
                    unselectable: true,
                    dim: true,
                    color: '#ffffff00', // fully transparent
                    level: 'filler',
                    division: div,
                    testament: test,
                    book: bk
                });
            }
        }

        return fillers;
    }

    const getColour = (book: string): any => {
        const colour: any = {
            "OLD": "#ffa700",
            "NEW": "#ffd500",

            "GEN": "#9BF5FB",
            "EXO": "#9BF5FB",
            "LEV": "#9BF5FB",
            "NUM": "#9BF5FB",
            "DEU": "#9BF5FB",

            "JOS": "#c9baff",
            "JDG": "#c9baff",
            "RUT": "#c9baff",
            "1SA": "#c9baff",
            "2SA": "#c9baff",
            "1KI": "#c9baff",
            "2KI": "#c9baff",
            "1CH": "#c9baff",
            "2CH": "#c9baff",
            "EZR": "#c9baff",
            "NEH": "#c9baff",
            "EST": "#c9baff",

            "JOB": "#fda1d0",
            "PSA": "#fda1d0",
            "PRO": "#fda1d0",
            "ECC": "#fda1d0",
            "SNG": "#fda1d0",

            "ISA": "#a9fbd0",
            "JER": "#a9fbd0",
            "LAM": "#a9fbd0",
            "EZK": "#a9fbd0",
            "DAN": "#a9fbd0",

            "HOS": "#ffe98d",
            "JOL": "#ffe98d",
            "AMO": "#ffe98d",
            "OBA": "#ffe98d",
            "JON": "#ffe98d",
            "MIC": "#ffe98d",
            "NAM": "#ffe98d",
            "HAB": "#ffe98d",
            "ZEP": "#ffe98d",
            "HAG": "#ffe98d",
            "ZEC": "#ffe98d",
            "MAL": "#ffe98d",

            "MAT": "#ffe98d",
            "MRK": "#ffe98d",
            "LUK": "#ffe98d",
            "JHN": "#ffe98d",

            "ACT": "#a9fbd0",

            "ROM": "#9BF5FB",
            "1CO": "#9BF5FB",
            "2CO": "#9BF5FB",
            "GAL": "#9BF5FB",
            "EPH": "#9BF5FB",
            "PHP": "#9BF5FB",
            "COL": "#9BF5FB",
            "1TH": "#9BF5FB",
            "2TH": "#9BF5FB",
            "1TI": "#9BF5FB",
            "2TI": "#9BF5FB",
            "TIT": "#9BF5FB",
            "PHM": "#9BF5FB",
            "HEB": "#9BF5FB",

            "JAS": "#fda1d0",
            "1PE": "#fda1d0",
            "2PE": "#fda1d0",
            "1JN": "#fda1d0",
            "2JN": "#fda1d0",
            "3JN": "#fda1d0",
            "JUD": "#fda1d0",

            "REV": "#c9baff"
        }

        return colour[book];
    }

    function average(color1: any,color2: any): any{
        const avg  = function(a: any,b: any){ return (a+b)/2; },
            t16  = function(c: any){ return parseInt((''+c).replace('#',''),16) },
            hex  = function(c: any){ const t = (c>>0).toString(16);
                return t.length == 2 ? t : '0' + t },
            hex1 = t16(color1),
            hex2 = t16(color2),
            r    = function(hex: any){ return hex >> 16 & 0xFF},
            g    = function(hex: any){ return hex >> 8 & 0xFF},
            b    = function(hex: any){ return hex & 0xFF};
        return '#' + hex(avg(r(hex1), r(hex2)))
            + hex(avg(g(hex1), g(hex2)))
            + hex(avg(b(hex1), b(hex2)));
    }

    // FixMe :: how to determine when foamtreeInstance is ready to display? hooks error at present
    // if (!foamtreeInstance) return <Spinner color="primary" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]"/>
    // else
    return (
            //@ts-ignore
            <div ref={element} className="absolute w-full sm:w-[44rem] h-[calc(100%-26rem)] sm:h-[calc(100%-17rem)] left-0 sm:left-[calc(50%-22rem)] top-[10.5rem] sm:top-[8rem]" id="treemap"></div>
    );
};

export default Treemap;