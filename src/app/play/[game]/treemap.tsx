"use client"

import React, { useEffect, useRef, useState } from 'react';

const mobileOptimisations = {
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
                    descriptionGroupType: "floating",
                    descriptionGroupMinHeight: 64,
                    descriptionGroupMaxHeight: 0.125,
                    groupBorderWidth: 4,
                    groupBorderRadius: 0.55,
                    groupInsetWidth: 4,
                    groupLabelMinFontSize: 0,
                    groupLabelMaxFontSize: 16,
                    rectangleAspectRatioPreference: 0,
                    groupLabelDarkColor: "#98a7d8",
                    groupLabelLightColor: "#060842",
                    groupLabelColorThreshold: 0.75,
                    parentFillOpacity: 1,
                    groupColorDecorator: function (opts: any, params: any, vars: any) {
                        vars.groupColor = params.group.color;
                        vars.labelColor = "auto";

                        if (params.group.dim || params.parent?.dim) {
                            vars.groupColor = average(params.group.color, "#0f0a31");
                        }
                    },
                    groupFillType: "plain",
                    groupLabelFontFamily: "inter",

                    ...(props.device != 'mobile' ? mobileOptimisations : {}),

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
                        } else {
                            //ts-ignore
                            this.open(event.group.id);
                            props.select(event.group.id, null, false);
                        }
                    },
                    openCloseDuration: 1000,
                    // onGroupHover: function (event: any) {
                    //     if (event.group) {
                    //         //@ts-ignore
                    //         this.open(event.group.id);
                    //     }
                    // },
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
            // treemap.set("dataObject", configure(props.data));
            treemap.set({
                groupColorDecorator: function(opts: any, params: any, vars: any) {

                    if (props.bookFound) {
                        if ((params.group.level == "book" || params.group.level == "chapter") && (params.group.id == props.passage.book || params.group.id.includes(props.passage.bookKey))) {
                            vars.groupColor = params.group.color;
                        } else if (params.group.level == "book") {
                            vars.groupColor = average(params.group.color, "#0f0a31");
                        }
                    }

                    if (props.divFound) {
                        if ((params.group.level == "division") && (params.group.id == props.passage.division.toLowerCase().replace(/\s/g, '-'))) {
                            vars.groupColor = params.group.color;
                        } else if (params.group.level == "division") {
                            vars.groupColor = average(params.group.color, "#0f0a31");
                        }
                    }

                    if (props.testFound) {
                        if ((params.group.level == "testament") && (params.group.id == props.passage.testament.toLowerCase())) {
                            vars.groupColor = params.group.color;
                        } else if (params.group.level == "testament") {
                            vars.groupColor = average(params.group.color, "#0f0a31");
                        }
                    }
                }
        });
        }

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
                level: 'book'
            })
        }

        return books
    }

    function getChapters(test: string, div: string,book: any, ch: number) {
        const chapters: any[] = [];

        for (let c = 1; c <= ch; c++) {
            chapters.push({
                id: book.key+'/'+c.toString(),
                label: c,
                weight: parseFloat(book.verses[c-1]),
                color: getColour(book.key),
                dim: isDim(book.name, 'book', props.bookFound),
                level: 'chapter'
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
            "LEV": "#1591ea",
            "NUM": "#317db5",
            "DEU": "#4aa5e6",

            "JOS": "#8967F6",
            "JDG": "#6c4ad8",
            "RUT": "#6339ea",
            "1SA": "#805af8",
            "2SA": "#8d6ef1",
            "1KI": "#6134f3",
            "2KI": "#6644d3",
            "1CH": "#7352dd",
            "2CH": "#7b57f1",
            "EZR": "#7756e1",
            "NEH": "#6d4dd5",
            "EST": "#7158c1",

            "JOB": "#C54A84",
            "PSA": "#C54A84",
            "PRO": "#e64993",
            "ECC": "#c52b73",
            "SNG": "#ef4a98",

            "ISA": "#58da93",
            "JER": "#4DBA7E",
            "LAM": "#2bca73",
            "EZK": "#199a53",
            "DAN": "#3c9f68",

            "HOS": "#D0B42B",
            "JOL": "#D0B42B",
            "AMO": "#D0B42B",
            "OBA": "#D0B42B",
            "JON": "#cdaf1c",
            "MIC": "#bda320",
            "NAM": "#bca536",
            "HAB": "#cdaf1c",
            "ZEP": "#c5a81c",
            "HAG": "#D0B42B",
            "ZEC": "#D0B42B",
            "MAL": "#caad1e",

            "MAT": "#D0B42B",
            "MRK": "#c5ad3c",
            "LUK": "#cdaf1c",
            "JHN": "#D0B42B",

            "ACT": "#4DBA7E",

            "ROM": "#36ABFF",
            "1CO": "#36ABFF",
            "2CO": "#36ABFF",
            "GAL": "#36ABFF",
            "EPH": "#1a74b5",
            "PHP": "#3ca0e8",
            "COL": "#36ABFF",
            "1TH": "#2786ca",
            "2TH": "#36ABFF",
            "1TI": "#36ABFF",
            "2TI": "#1e8edf",
            "TIT": "#458dc1",
            "PHM": "#36ABFF",
            "HEB": "#2190df",

            "JAS": "#C54A84",
            "1PE": "#C54A84",
            "2PE": "#e15094",
            "1JN": "#c81f6f",
            "2JN": "#b85684",
            "3JN": "#e12b81",
            "JUD": "#ea4b96",

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
        <div ref={element} className="absolute w-full h-full left-0 top-0" id="treemap"></div>
    );
};

export default Treemap;