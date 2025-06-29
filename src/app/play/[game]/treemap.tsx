"use client"

import React, { useEffect, useRef, useState } from 'react';
import hexToRgba from 'hex-to-rgba';
import { toast } from "react-hot-toast";

const mobileOptimisations = {
    pixelRatio: window.devicePixelRatio || 1,
    relaxationVisible: false,
    relaxationQualityThreshold: 5,
    rolloutDuration: 0,
    pullbackDuration: 0,
    finalCompleteDrawMaxDuration: 50,
    finalIncrementalDrawMaxDuration: 20,
    interactionHandler: "hammerjs"
}

/**
 * Voronoi Treemap Component for displaying the Bible
 * @since 1st June 2025
 */
//@ts-ignore
const Treemap = (props: any) => {
    //@ts-ignore
    const element = useRef()
    const [ treemap, setTreemap ] = useState();

    const [ divisions, setDivisions ] = useState(getDivKeys());
    const [ books, setBooks ] = useState(getBookKeys());

    useEffect(() => {
        //@ts-ignore
        if (!element.current.foamTree) {
            import("@carrotsearch/foamtree").then(module => {
                const tree = new module.FoamTree({
                    element: element.current,
                    dataObject: configure(props.data),
                    layoutByWeightOrder: false,
                    relaxationInitializer: "treemap",
                    // descriptionGroupType: "floating",
                    descriptionGroupMinHeight: 64,
                    descriptionGroupMaxHeight: 0.125,
                    groupBorderWidth: 4,
                    groupBorderRadius: 0.55,
                    groupInsetWidth: 2,
                    groupLabelMinFontSize: 0,
                    groupLabelMaxFontSize: 16,
                    rectangleAspectRatioPreference: 0,
                    groupLabelDarkColor: "#98a7d8",
                    groupLabelLightColor: "#060842",
                    groupLabelColorThreshold: 1,
                    parentFillOpacity: 0.65,
                    groupColorDecorator: function (opts: any, params: any, vars: any) {
                        vars.labelColor = "auto";

                        if (params.group.level == "chapter" && !!params.group.color) {
                            const rgba =  hexToRgba(params.group.color).substring(5, 18);
                            const parts = rgba.split(', ');

                            vars.groupColor.r = parts[0];
                            vars.groupColor.g = parts[1];
                            vars.groupColor.b = parts[2];
                            vars.groupColor.a = 0.95;

                            if (params.group.level == "chapter" && (params.group.icon == props.passage.icon)) {
                                vars.groupColor.a = 1;
                            }
                        } else {
                            vars.groupColor = params.group.color;
                        }
                    },
                    groupFillType: "plain",
                    groupLabelFontFamily: "inter",

                    ...(props.device == 'mobile' ? mobileOptimisations : {}),

                    // Roll out in groups
                    rolloutMethod: "groups",
                    // rolloutDuration: 0,

                    onRolloutComplete: function () {
                        // this.set("open", { open: false, groups: [...divisions, ...books] });
                        this.set("open", { open: false, groups: [...books] });

                        if (props.bookFound) {
                            this.open(props.passage.book);
                        }
                    },
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
                    onGroupHover: function (event: any) {
                        // if (event.group) {
                        //     //@ts-ignore
                        //     this.open(event.group.id);
                        // }
                    },
                    onGroupMouseWheel: function (event: any) {
                        if (event.delta < 0) {
                            //@ts-ignore
                            this.set("open", {
                                // groups: [...books, ...divisions],
                                groups: [...books],
                                open: false,
                                keepPrevious: true
                            });
                        }
                        if (event.delta > 0) {
                            this.open(event.group.id);
                        }
                    }
                });

                //@ts-ignore
                element.current.foamTree = tree;
                setTreemap(tree);
            });
        }

        return () => {
            if (treemap) {
                //@ts-ignore
                treemap.dispose();
                //@ts-ignore
                element.current.foamTree = null;
                //@ts-ignore
                setTreemap(null);
            }
        }
    }, []);

    useEffect(() => {
        if (treemap && (props.bookFound || props.divFound || props.testFound)) {
            //@ts-ignore
            treemap.set({
                groupColorDecorator: function(opts: any, params: any, vars: any) {

                    if (props.bookFound) {
                        if (params.group.level == "chapter" && !!params.group.color ) {
                            if (params.group.book == props.passage.book) {
                                vars.groupColor = params.group.color;
                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.5;
                            }
                        } else if (params.group.level == "book" && !!params.group.color ) {
                            if (params.group.label == props.passage.book) {
                                vars.groupColor = params.group.color;
                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.5;
                            }
                        } else {
                            vars.groupColor = params.group.color;
                        }
                    } else if (props.divFound) {
                        if (params.group.level == "chapter" && !!params.group.color) {
                            if (params.group.division == props.passage.division) {
                                vars.groupColor = params.group.color;

                            } else {
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.5;
                            }
                        } else if (params.group.level == "book" && !!params.group.color ) {
                            if (params.group.division == props.passage.division) {
                                vars.groupColor = params.group.color;
                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.5;
                            }
                        } else {
                            vars.groupColor = params.group.color;
                        }
                    } else if (props.testFound) {
                        if (params.group.level == "chapter" && !!params.group.color) {
                            if (params.group.testament == props.passage.testament) {
                                vars.groupColor = params.group.color;

                            } else {
                                const rgba =  hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.5;
                            }
                        } else if (params.group.level == "book" && !!params.group.color ) {
                            if (params.group.testament == props.passage.testament) {
                                vars.groupColor = params.group.color;
                            } else {
                                const rgba = hexToRgba(params.group.color).substring(5, 18);
                                const parts = rgba.split(', ');

                                vars.groupColor.r = parts[0];
                                vars.groupColor.g = parts[1];
                                vars.groupColor.b = parts[2];
                                vars.groupColor.a = 0.5;
                            }
                        } else {
                            vars.groupColor = params.group.color;
                        }
                    }
                }
        });
        }

        // question :: alt to zoom?
        //@ts-ignore
        if (props.bookFound) treemap.zoom(props.passage.book)
        //@ts-ignore
        else if (props.divFound) treemap.zoom(props.passage.division.toLowerCase().replace(/\s/g, '-'))
        //@ts-ignore
        else if (props.testFound) treemap.zoom(props.passage.testament.toLowerCase());

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
                color: getColour(d.books[0].key),
                unselectable: true,
                dim: isDim(d.name, 'division', props.divFound) || isDim(test, 'testament', props.testFound),
                level: 'division'
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
                color: getColour(b.key),
                // unselectable: true,
                dim: isDim(b.name, 'book', props.bookFound),
                level: 'book',
                testament: test,
                division: div,
                book: b.name
            })
        }

        return books
    }

    function getChapters(test: string, div: string, book: any, ch: number) {
        const chapters: any[] = [];

        for (let c = 1; c <= ch; c++) {
            chapters.push({
                id: book.key+'/'+c.toString(),
                label: props.passage.icon == book.icons[c-1] ? c : '',
                weight: parseFloat(book.verses[c-1]),
                color: getColour(book.key),
                dim: isDim(book.name, 'book', props.bookFound),
                level: 'chapter',
                chapter: c,
                icon: book.icons[c-1],
                testament: test,
                division: div,
                book: book.name
            })
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

    const getColour = (book: string): any => {
        const colour: any = {
            "OLD": "#ffa700",
            "NEW": "#ffd500",

            "GEN": "#36ABFF",
            "EXO": "#36ABFF",
            "LEV": "#36ABFF",
            "NUM": "#36ABFF",
            "DEU": "#36ABFF",

            "JOS": "#8967F6",
            "JDG": "#8967F6",
            "RUT": "#8967F6",
            "1SA": "#8967F6",
            "2SA": "#8967F6",
            "1KI": "#8967F6",
            "2KI": "#8967F6",
            "1CH": "#8967F6",
            "2CH": "#8967F6",
            "EZR": "#8967F6",
            "NEH": "#8967F6",
            "EST": "#8967F6",

            "JOB": "#C54A84",
            "PSA": "#C54A84",
            "PRO": "#C54A84",
            "ECC": "#C54A84",
            "SNG": "#C54A84",

            "ISA": "#58da93",
            "JER": "#58da93",
            "LAM": "#58da93",
            "EZK": "#58da93",
            "DAN": "#58da93",

            "HOS": "#D0B42B",
            "JOL": "#D0B42B",
            "AMO": "#D0B42B",
            "OBA": "#D0B42B",
            "JON": "#D0B42B",
            "MIC": "#D0B42B",
            "NAM": "#D0B42B",
            "HAB": "#D0B42B",
            "ZEP": "#D0B42B",
            "HAG": "#D0B42B",
            "ZEC": "#D0B42B",
            "MAL": "#D0B42B",

            "MAT": "#D0B42B",
            "MRK": "#D0B42B",
            "LUK": "#D0B42B",
            "JHN": "#D0B42B",

            "ACT": "#4DBA7E",

            "ROM": "#36ABFF",
            "1CO": "#36ABFF",
            "2CO": "#36ABFF",
            "GAL": "#36ABFF",
            "EPH": "#36ABFF",
            "PHP": "#36ABFF",
            "COL": "#36ABFF",
            "1TH": "#36ABFF",
            "2TH": "#36ABFF",
            "1TI": "#36ABFF",
            "2TI": "#36ABFF",
            "TIT": "#36ABFF",
            "PHM": "#36ABFF",
            "HEB": "#36ABFF",

            "JAS": "#C54A84",
            "1PE": "#C54A84",
            "2PE": "#C54A84",
            "1JN": "#C54A84",
            "2JN": "#C54A84",
            "3JN": "#C54A84",
            "JUD": "#C54A84",

            "REV": "#8967F6"
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

    return (
        //@ts-ignore
        <div ref={element} className="absolute w-full h-[calc(100%-17.5rem)] sm:h-[calc(100%-17rem)] left-0 top-[10rem] sm:top-[8rem]" id="treemap"></div>
    );
};

export default Treemap;