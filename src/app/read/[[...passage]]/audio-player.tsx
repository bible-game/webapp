import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, X, Download } from "lucide-react";

export function AudioPlayer({ src, onClose }: { src: string; onClose?: () => void }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [rate, setRate] = useState(1);

    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;
        const onLoaded = () => setDuration(a.duration || 0);
        const onTime = () => setTime(a.currentTime || 0);
        const onEnd = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        a.addEventListener("loadedmetadata", onLoaded);
        a.addEventListener("timeupdate", onTime);
        a.addEventListener("ended", onEnd);
        a.addEventListener("play", onPlay);
        a.addEventListener("pause", onPause);

        a.play().catch(() => setIsPlaying(false));

        return () => {
            a.removeEventListener("loadedmetadata", onLoaded);
            a.removeEventListener("timeupdate", onTime);
            a.removeEventListener("ended", onEnd);
            a.removeEventListener("play", onPlay);
            a.removeEventListener("pause", onPause);
        };
    }, [src]);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        a.paused ? a.play() : a.pause();
    };

    const seek = (v: number) => {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = v;
        setTime(v);
    };

    const setVol = (v: number) => {
        const a = audioRef.current;
        if (!a) return;
        a.volume = v;
        setVolume(v);
    };

    const setPlayback = (r: number) => {
        const a = audioRef.current;
        if (!a) return;
        a.playbackRate = r;
        setRate(r);
    };

    const fmt = (s: number) => {
        if (!isFinite(s)) return "0:00";
        const m = Math.floor(s / 60);
        const ss = Math.floor(s % 60);
        return `${m}:${ss.toString().padStart(2, "0")}`;
    };

    return (
        <div role="region" aria-label="Audio player" className="flex items-center gap-2">
            <audio ref={audioRef} src={src} preload="metadata" />
            <button
                onClick={toggle}
                className="ui-icon reader-glow-fill !text-[var(--reader-on-accent)]"
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
            </button>

            <div className="min-w-0 flex-1">
                <input
                    type="range"
                    aria-label="Playback position"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={Math.min(time, duration || 0)}
                    onChange={(e) => seek(parseFloat(e.target.value))}
                    className="reader-range"
                    style={{ "--fill": `${duration ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
                />
                <div className="flex items-center justify-between text-[11px] tabular-nums text-[var(--reader-muted)]">
                    <span>{fmt(time)}</span>
                    <span>{fmt(duration)}</span>
                </div>
            </div>

            <div className="hidden sm:flex items-center">
                <button
                    onClick={() => setVol(volume ? 0 : 1)}
                    className="ui-icon"
                    aria-label={volume ? "Mute" : "Unmute"}
                >
                    {volume ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                </button>
            </div>

            <select
                value={rate}
                onChange={(e) => setPlayback(parseFloat(e.target.value))}
                className="min-h-11 rounded-lg bg-transparent px-1 text-sm tabular-nums text-[var(--reader-text)]"
                aria-label="Playback speed"
            >
                {[0.75, 1, 1.25, 1.5].map((r) => (
                    <option key={r} value={r} className="bg-ui-surface">{r}×</option>
                ))}
            </select>

            <a href={src} download className="ui-icon !hidden sm:!inline-flex" aria-label="Download audio">
                <Download className="size-4" />
            </a>

            {onClose && (
                <button
                    onClick={() => {
                        const a = audioRef.current;
                        if (a) a.pause();
                        onClose();
                    }}
                    className="ui-icon"
                    aria-label="Close player"
                >
                    <X className="size-5" />
                </button>
            )}
        </div>
    );
}
