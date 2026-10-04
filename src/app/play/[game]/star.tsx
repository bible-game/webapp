import React from "react";

export const Star = ({
                       filled = true, shadow = true, popping = false, className = "",
                   }: { filled?: boolean; shadow?: boolean, popping?: boolean; className?: string }) => (
    <svg
        className={[
            // base sizing + smooth transforms
            "size-6 transition-transform duration-300",
            // hover “pop” on the whole row
            "group-hover:scale-110",
            // glow & color: the glow follows the star's own colour, so a themed star glows in its theme
            filled
                ? "text-yellow-300"
                : "text-[#D9D9D9]",
            shadow
                ? "[filter:drop-shadow(0_0_6px_color-mix(in_srgb,currentColor_60%,transparent))_drop-shadow(0_0_18px_color-mix(in_srgb,currentColor_30%,transparent))]"
                : "",
            // one-shot pop (applied only to the newest earned star)
            popping
                ? "scale-125 rotate-6 [filter:drop-shadow(0_0_12px_currentColor)_drop-shadow(0_0_28px_color-mix(in_srgb,currentColor_60%,transparent))]"
                : "",
            className,
        ].join(" ")}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "gray"}
        strokeWidth={1.5}
        stroke={filled ? "currentColor" : "gray"}
        aria-hidden="true"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
    </svg>
);