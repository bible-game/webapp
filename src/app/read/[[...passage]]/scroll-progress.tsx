'use client';

import React, { useEffect, useState } from 'react';

interface Props {
    containerRef?: React.RefObject<HTMLDivElement>;
    className?: string;
    height?: number;
}

export default function ScrollProgress(props: Props) {
    const { containerRef, className = '', height = 6 } = props;
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const target = containerRef?.current || document.documentElement;
            const { scrollTop, scrollHeight, clientHeight } = target;
            const totalHeight = scrollHeight - clientHeight;
            const progress = totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;
            setScrollProgress(progress);
        };

        const target = containerRef?.current || window;
        target.addEventListener('scroll', handleScroll);
        return () => target.removeEventListener('scroll', handleScroll);
    }, [containerRef]);

    return (
        <div
            aria-hidden
            className={`fixed top-0 left-0 bg-gradient-to-r from-indigo-600 to-violet-600 ${className}`}
            style={{ width: `${scrollProgress}%`, height: `${height}px`, zIndex: 50 }}
        />
    );
}