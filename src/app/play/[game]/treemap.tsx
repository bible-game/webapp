"use client"

import React, { useEffect, useRef, useState } from 'react';

/**
 * Voronoi Treemap Component for displaying the Bible
 * @since 1st June 2025
 */
const Treemap = (props: any) => {
    const [treemap, setTreemap] = useState({} as any);

    useEffect(() => {
        import("@carrotsearch/foamtree").then(module => {
            setTreemap(new module.FoamTree({
                id: 'treemap',
                logging: true,
                dataObject: props.data,
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

                // onRolloutComplete: function () {
                //     tree.set("open", { open: false, groups: [...divisions, ...books] });
                // },
                onGroupClick: function (event: any) {
                    const url = `https://dev.bible.game/read/${event.group.id}`;
                    window.open(url, '_blank');

                },
                openCloseDuration: 1000,
                // onGroupHover: function (event: any) {
                //     if (!!event.group) {
                //         foamtree.open(event.group.id);
                //     }
                // },
                // onGroupMouseWheel: function (event: any) {
                //     if (event.delta < 0) {
                //         tree.set("open", { groups: [...books, ...divisions], open: false, keepPrevious: true});
                //     }
                //     if (event.delta > 0) {
                //         tree.open(event.group.id);
                //     }
                // }
            }));

            const element = document.getElementById('treemap') as any;
            if (element) {
                console.log(element.hasAttribute('data-foamtree'));
                element.removeAttribute('data-foamtree');
                console.log(element.hasAttribute('data-foamtree'));
            }
        });
    }, []);

    return (
        <div className="absolute w-full h-full" id="treemap"></div>
    );
};

export default Treemap;
