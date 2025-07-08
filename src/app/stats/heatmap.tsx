"use client"

import React, { useEffect, useRef, useState } from 'react';

const mobileOptimisations = {
    // pixelRatio: window.devicePixelRatio || 1,
    relaxationVisible: false,
    relaxationQualityThreshold: 5,
    rolloutDuration: 0,
    pullbackDuration: 0,
    finalCompleteDrawMaxDuration: 50,
    finalIncrementalDrawMaxDuration: 20,
    interactionHandler: "hammerjs"
}

//@ts-ignore
const Heatmap = (props: any) => {
    //@ts-ignore
    const element = useRef()
    const [ treemap, setTreemap ] = useState();

    useEffect(() => {
        //@ts-ignore
        if (!element.current.foamTree) {
            import("@carrotsearch/foamtree").then(module => {
                const tree = new module.FoamTree({
                    element: element.current,
                    dataObject: configure(props.data),
                    layoutByWeightOrder: false,
                    relaxationInitializer: "treemap",
                    layout: "squarified",
                    groupBorderWidth: 0,
                    groupBorderRadius: 0,
                    groupInsetWidth: 0,
                    groupMinDiameter: 0,
                    groupLabelMinFontSize: 0,
                    groupLabelMaxFontSize: 16,
                    rectangleAspectRatioPreference: 0,
                    groupLabelDarkColor: "#98a7d8",
                    groupLabelLightColor: "#060842",
                    groupLabelColorThreshold: 1,
                    parentFillOpacity: 0.65,
                    groupLabelFontFamily: "inter",

                    ...(props.device == 'mobile' ? mobileOptimisations : {}),

                    // Roll out in groups
                    rolloutMethod: "groups",
                    groupColorDecorator: function (opts: any, params: any, vars: any) {
                        if (params.group.level == 'verse') {
                            vars.groupColor.model = "rgba";
                            if (params.group.value === '') {
                                vars.groupColor.a = 0;
                                vars.groupColor.r = 255;
                                vars.groupColor.g = 255;
                                vars.groupColor.b = 255;

                            } else if (params.group.value === 0) {
                                vars.groupColor.r = 255;
                                vars.groupColor.g = 120;
                                vars.groupColor.b = 120;
                                vars.groupColor.a = 1;
                            } else if (params.group.value > 0) {
                                vars.groupColor.r = 120;
                                vars.groupColor.g = 255;
                                vars.groupColor.b = 120;
                                vars.groupColor.a = 1;
                            }
                        } else {
                            vars.groupColor = params.group.color;
                        }
                    },
                    groupFillType: "plain",
                    onGroupDoubleClick: function (event: any) {
                        event.preventDefault();
                    },

                    openCloseDuration: 1000
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
        const books: any[] = [];

        for (const book of data) {
            books.push({
                id: book.book.toLowerCase(),
                groups: getChapters(book.book, book.chapters),
                label: book.book,
                open: true,
                weight: getBookWeight(book.chapters),
                unselectable: true,
                level: 'book'
            })
        }

        return { groups: books }
    }

    function getChapters(book: string, chapters: any) {
        const ch: any[] = [];

        for (const chapter of chapters) {
            ch.push({
                id: book+chapter.chapter,
                groups: getVerses(book, chapter.chapter, chapter.verses),
                label: chapter.chapter,
                open: true,
                weight: chapter.verses.length,
                unselectable: true,
                level: 'chapter'
            })
        }

        return ch
    }

    function getVerses(book: string, chapter: string, verses: any) {
        const ver: any[] = [];

        for (let i = 0; i < verses.length; i++) {
            ver.push({
                id: book+chapter+'-'+i,
                label: i,
                open: true,
                weight: 1.0,
                unselectable: true,
                level: 'verse',
                value: verses[i]
            })
        }

        return ver
    }

    function getBookWeight(chapters: any) {
        let weight = 0.0;

        for (const ch of chapters) {
            for (const ver of ch.verses) {
                weight++;
            }
        }

        return weight;
    }

    return (
        //@ts-ignore
        <div ref={element} className="absolute w-full sm:w-[46rem] h-[calc(100%-17.5rem)] sm:h-[calc(100%-17rem)] left-0 sm:left-[calc(50%-23rem)] top-[12rem] sm:top-[10rem]" id="heatmap"></div>
    );
};

export default Heatmap;