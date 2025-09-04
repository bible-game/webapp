import React, { useEffect, useRef } from "react";
import { XIcon } from "lucide-react";
import useSWR from "swr";
import {Passage} from "@/core/model/play/passage";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PassageViewer({ id, title, open, onClose }: {
    id: string;
    title: string;
    open: boolean;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement | null>(null);

    const {data, error, isLoading} = useSWR(`${process.env.SVC_BIBLE}/${title}`, fetcher);

    // Lock background scroll when open
    useEffect(() => {
        if (!open) return;
        const {overflow} = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [open]);

    // Basic focus trap
    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        panelRef.current?.focus();
        return () => previouslyFocused?.focus();
    }, [open]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            id={id}
            className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}/>
            <div className="absolute inset-0 grid place-items-center md:place-items-stretch">
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    className="relative w-[100vw] sm:w-[92vw] max-w-2xl md:(w-[38rem] h-full ml-auto) bg-white rounded-2xl md:rounded-none md:rounded-l-2xl shadow-xl md:shadow-2xl ring-1 ring-slate-200 focus:outline-none animate-in fade-in zoom-in-95 md:slide-in-from-right">
                    <header
                        className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b bg-white/80 backdrop-blur-sm">
                        <div className="min-w-0">
                            <h2 id={`${id}-title`} className="text-base font-semibold truncate">
                                {title}
                            </h2>
                            <p className="text-xs text-slate-500">Press Esc to close · V to toggle</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300"
                            aria-label="Close">
                            <XIcon className="size-5"/>
                        </button>
                    </header>

                    <div className="p-4 md:p-5 overflow-y-auto max-h-[90vh] sm:max-h-[75vh] md:max-h-none md:h-[calc(100vh-3.25rem)]">
                        <pre className="whitespace-pre-wrap leading-relaxed text-[15px] text-slate-800 pb-8">{isLoading ? "(Passage text unavailable)" : data['text'] }</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
