'use client';

import React, { useEffect, useState } from 'react';

interface Props {
    containerRef?: React.RefObject<HTMLDivElement>;
    className?: string;
    height?: number;
}

export default function ScrollProgress(props: Props) {
    // Props
    const { containerRef, className = '', height = 7 } = props;

    // State
    const [scrollProgress, setScrollProgress] = useState(0);

    // Effects
    useEffect(() => {
        const handleScroll = () => {
            /**
             * Determine the target element to calculate scroll progress.
             * If a containerRef is provided, use that element; otherwise, use the document element.
             */
            const target = containerRef?.current || document.documentElement;

            // Calculate the scroll progress based on the target element's scroll position
            const { scrollTop, scrollHeight, clientHeight } = target;
            const totalHeight = scrollHeight - clientHeight;
            const progress = (scrollTop / totalHeight) * 100;

            // Update the scroll progress state
            setScrollProgress(progress);
        };

        const target = containerRef?.current || window;

        // Add a scroll event listener to the target element
        target.addEventListener('scroll', handleScroll);

        return () => {
            // Remove the scroll event listener when the component is unmounted
            target.removeEventListener('scroll', handleScroll);
        };
    }, [containerRef]);

    return (
        <div
            className={`fixed top-0 left-0 w-full bg-blue-700 ${className}`}
            style={{ width: `${scrollProgress}%`, height: `${height}px`, zIndex: 99999 }}
        />
    );
}