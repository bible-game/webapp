import React from "react";
import Link from "next/link";

/**
 * Navigation Component
 * @since 12th April 2025
 */
export const Navigation = (props: any) => {
    const links = [];

    const textStyle = `${props.dark ? "text-black" : "text-white"} font-light text-sm`

    if (props.play) links.push(
        <Link href='/' key='play'>
            <div className="flex gap-1 items-center w-[4rem]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25"
                     stroke={props.dark ? "black" : "currentColor"} className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/>
                </svg>
                <p className={textStyle}>Play</p>
            </div>
        </Link>
    );
    if (props.read) links.push(
        <Link href='/read/Genesis/1' key='read'>
            <div className="flex gap-1 items-center w-[4rem]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25"
                     stroke={props.dark ? "black" : "currentColor"} className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                </svg>
                <p className={textStyle}>Read</p>
            </div>
        </Link>
    );
    if (props.stats) links.push(
        <Link href='/stats' key='stats'>
            <div className="flex gap-1 items-center w-[4rem]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25"
                     stroke={props.dark ? "black" : "currentColor"} className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"/>
                </svg>
                <p className={textStyle}>Stats</p>
            </div>
        </Link>
    );

    return (
        <section className="flex absolute justify-end sm:top-[4.5rem] w-[75vw] sm:w-[38rem] top-[2rem]">
            <div className="flex justify-end relative gap-4">
                {links.map((link: any) => link)}
            </div>
        </section>
    )
}

export default Navigation;