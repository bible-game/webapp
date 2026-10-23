import React from "react";

/**
 * The Ground (1.2 "Atmosphere"): a near-black foundation under broad, diffuse fields of navy, indigo and purple, each
 * larger than the screen, drifting on slow, offset cycles. Atmospheric, not illustrative: no stars, noise or texture.
 * One ground behind every page (and copies in solid chrome: GroundWindow); still under reduced motion. Styles in globals.sass (.ground).
 * @since 23rd October 2026
 */
export default function Ground({ copy }: { copy?: boolean }) {
    return <div aria-hidden="true" className={copy ? "ground ground-copy" : "ground"}>
        <span className="ground-navy"/>
        <span className="ground-indigo"/>
        <span className="ground-purple"/>
        <span className="ground-deep"/>
    </div>;
}
