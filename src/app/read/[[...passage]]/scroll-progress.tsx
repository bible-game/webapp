'use client';

import React, { useEffect, useState } from 'react';

/** Progress through the page, drawn as a glowing line along the bottom of its container */
export default function ScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            const totalHeight = scrollHeight - clientHeight;
            setScrollProgress(totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <div aria-hidden className="reader-progress">
            <div style={{ width: `${scrollProgress}%` }} />
        </div>
    );
}
