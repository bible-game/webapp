import React from "react";
import Link from "next/link";

/**
 * Navigation Component
 * @since 12th April 2025
 */
export const Navigation = (props: any) => {
    const links = [];

    if (props.play) links.push(<div className="w-[4rem]"><Link href='/play' key='play'><p className="text-blue-400">Play</p></Link></div>);
    if (props.read) links.push(<div className="w-[4rem]"><Link href='/read/genesis1' key='read'><p className="text-purple-400">Read</p></Link></div>);
    if (props.stats) links.push(<div className="w-[4rem]"><Link href='/stats' key='stats'><p className="text-green-400">Stats</p></Link></div>);

    return (
        <section className="flex absolute top-[4.375rem] w-[38rem] justify-end">
            <div className="flex justify-end relative">
                {links.map((link: any) => link)}
            </div>
        </section>
    )
}

export default Navigation;