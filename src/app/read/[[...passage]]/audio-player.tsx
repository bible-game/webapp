import { useEffect, useRef, useState } from "react";
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
        <div className="mt-2 bg-white/90 backdrop-blur-sm ring-1 ring-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <audio ref={audioRef} src={src} preload="metadata" />
            <div className="flex items-center gap-3">
                {/* Play / Pause */}
                <button
                    onClick={toggle}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow hover:brightness-110"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                </button>

                {/* Timeline */}
                <div className="flex-1">
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={Math.min(time, duration || 0)}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{fmt(time)}</span>
                        <span>{fmt(duration)}</span>
                    </div>
                </div>

                {/* Volume (desktop) */}
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={() => setVol(volume ? 0 : 1)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        aria-label={volume ? "Mute" : "Unmute"}
                    >
                        {volume ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => setVol(parseFloat(e.target.value))}
                        className="w-20 accent-indigo-600"
                    />
                </div>

                {/* Speed / Download / Close */}
                <div className="flex items-center gap-2">
                    <select
                        value={rate}
                        onChange={(e) => setPlayback(parseFloat(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
                        aria-label="Playback speed"
                    >
                        {[0.75, 1, 1.25, 1.5].map((r) => (
                            <option key={r} value={r}>{r}×</option>
                        ))}
                    </select>

                    <a
                        href={src}
                        download
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        aria-label="Download audio"
                    >
                        <Download className="size-4" />
                    </a>

                    {onClose && (
                        <button
                            onClick={() => {
                                const a = audioRef.current;
                                if (a) a.pause();
                                onClose();
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            aria-label="Close player"
                        >
                            <X className="size-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
