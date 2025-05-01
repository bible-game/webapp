import React from "react";
import Link from "next/link";

/**
 * Navigation Component
 * @since 12th April 2025
 */
export const Navigation = (props: any) => {
    const links = [];

    if (props.play) links.push(<Link href='/play' key='play'><p>Play</p></Link>);
    if (props.read) links.push(<Link href='/read' key='read'><p>Read</p></Link>);
    if (props.stats) links.push(<Link href='/stats' key='stats'><p>Stats</p></Link>);

    return (
        <section>
            {links.map((link: any) => link)}
        </section>
    )
}

export default Navigation;