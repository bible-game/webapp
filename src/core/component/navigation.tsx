import React from "react";
import Link from "next/link";

/**
 * Navigation Component
 * @since 12th April 2025
 */
export const Navigation = (props: any) => {
    const links = [];

    if (props.play) links.push(<div className="pl-4"><Link href='/play' key='play'><p>Play</p></Link></div>);
    if (props.read) links.push(<div className="pl-4"><Link href='/read' key='read'><p>Read</p></Link></div>);
    if (props.stats) links.push(<div className="pl-4"><Link href='/stats' key='stats'><p>Stats</p></Link></div>);

    return (
        <section className="flex justify-end relative">
            {links.map((link: any) => link)}
        </section>
    )
}

export default Navigation;