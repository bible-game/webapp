"use client"

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { ChevronUp, HeadphonesIcon } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { AudioPlayer } from "@/app/read/[[...passage]]/audio-player";

type Props = {
    onType: () => void;
    translation: string;
    onTranslation: () => void;
    audio: { src?: string; loading: boolean; onListen: () => void; onClose: () => void };
};

/**
 * Reader toolbar: the reading controls, and the audio player while listening
 * @since 8th October 2026
 */
export default function ReaderToolbar(props: Props) {
    const { audio } = props;
    const [hidden, setHidden] = useState(false);

    // Tuck away while reading down the page; return on scroll up or at the end
    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const doc = document.documentElement;
            const atEnd = y + doc.clientHeight >= doc.scrollHeight - 80;
            if (atEnd || y < 80 || y < last - 6) setHidden(false);
            else if (y > last + 6) setHidden(true);
            last = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const visible = !hidden || !!audio.src;

    return (
        <div
            className={`reader-toolbar fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 motion-reduce:transition-none ${visible ? "" : "translate-y-[calc(100%+8px)]"}`}
            onFocusCapture={() => setHidden(false)}
        >
            <Toaster position="top-center" />
            <div className="mx-auto max-w-[43rem] px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-6 sm:px-6">
                {audio.src ? <AudioPlayer src={audio.src} onClose={audio.onClose} /> : null}

                <nav aria-label="Reading controls" className="mt-1 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-4 px-2">
                    <button type="button" className="ui-icon reader-tool" aria-label="Text settings" onClick={props.onType}>
                        <span aria-hidden className="text-[17px] font-medium tracking-tight">Aa</span>
                    </button>
                    <button type="button" className="reader-tool mx-auto flex min-h-11 min-w-0 max-w-full items-center gap-1.5 rounded-full px-3 text-[13px] font-medium"
                            aria-label={`Translation: ${props.translation}. Change translation`} onClick={props.onTranslation}>
                        <span className="truncate">{props.translation}</span>
                        <ChevronUp aria-hidden className="size-4 shrink-0" />
                    </button>
                    <button
                        type="button"
                        className="ui-icon reader-tool"
                        aria-label="Listen to passage"
                        aria-pressed={!!audio.src}
                        data-on={!!audio.src || undefined}
                        disabled={audio.loading}
                        onClick={audio.src ? audio.onClose : audio.onListen}
                    >
                        {audio.loading ? <Spinner size="sm" color="default" /> : <HeadphonesIcon className="size-5" />}
                    </button>
                </nav>
            </div>
        </div>
    );
}
