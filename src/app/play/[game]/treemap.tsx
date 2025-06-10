"use client"

import React, { useEffect, useRef, useState } from 'react';

/**
 * Voronoi Treemap Component for displaying the Bible
 * @since 1st June 2025
 */
//@ts-ignore
const Treemap = (props: any ) => {
    //@ts-ignore
    const element = useRef()
    const [ treemap, setTreemap ] = useState();

    const [ divisions, setDivisions ] = getDivKeys();
    const [ books, setBooks ] = getBookKeys();

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
                    },
                    groupFillType: "plain",
                    groupLabelFontFamily: "inter",

                    // mobile optimisation
                    // relaxationVisible: false,
                    // relaxationQualityThreshold: 5,
                    // rolloutDuration: 0,
                    // pullbackDuration: 0,
                    // finalCompleteDrawMaxDuration: 50,
                    // finalIncrementalDrawMaxDuration: 20,
                    // interactionHandler: "hammerjs",

                    // Roll out in groups
                    rolloutMethod: "groups",

                    onRolloutComplete: function () {
                        if (treemap) {
                            //@ts-ignore
                            treemap.set("open", { open: false, groups: [...divisions, ...books] });
                        }
                    },
                    onGroupClick: function (event: any) {
                        const selection = event.group.id.split('/');
                        props.select(selection[0], selection[1]);
                    },
                    openCloseDuration: 1000,
                    onGroupHover: function (event: any) {
                        if (event.group && treemap) {
                            //@ts-ignore
                            treemap.open(event.group.id);
                        }
                    },
                    onGroupMouseWheel: function (event: any) {
                        if (event.delta < 0) {
                            if (treemap) {
                                //@ts-ignore
                                treemap.set("open", {
                                    groups: [...books, ...divisions],
                                    open: false,
                                    keepPrevious: true
                                });
                            }
                        }
                        if (event.delta > 0) {
                            if (treemap) {
                                //@ts-ignore
                                treemap.open(event.group.id);
                            }
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

    function configure(data: any) {
        const testaments: any[] = [];

        for (const test of data) {
            testaments.push({
                id: test.name.toLowerCase(),
                groups: getDivisions(test.divisions),
                label: test.name,
                open: true,
                weight: getTestamentWeight(test),
                unselectable: true
            })
        }

        return { groups: testaments }
    }

    function getDivisions(div: any) {
        const divisions: any[] = [];

        for (const d of div) {
            divisions.push({
                id: d.name.toLowerCase().replace(/\s/g, '-'),
                groups: getBooks(d.books),
                label: d.name,
                open: true,
                weight: getDivisionWeight(d),
                color: getColour(d.books[0].key),
                unselectable: true
            })
        }

        return divisions
    }

    function getBooks(bk: any) {
        const books: any[] = [];

        for (const b of bk) {
            books.push({
                id: b.key,
                label: b.name,
                open: true,
                groups: getChapters(b, b.chapters),
                weight: getBookWeight(b),
                color: getColour(b.key),
                unselectable: true
            })
        }

        return books
    }

    function getChapters(book: any, ch: number) {
        const chapters: any[] = [];

        for (let c = 1; c <= ch; c++) {
            chapters.push({
                id: book.key+'/'+c.toString(),
                label: c,
                weight: parseFloat(book.verses[c-1]),
                color: getColour(book.key)
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
                    book.push(bk.key)
                }
            }
        }

        return book;
    }

    const getColour = (book: string): any => {
        const colour: any = {
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

    return (
        //@ts-ignore
        <div ref={element} className="absolute w-full h-full left-0 top-0" id="treemap"></div>
    );
};

export default Treemap;