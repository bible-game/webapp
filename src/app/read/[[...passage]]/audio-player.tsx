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
        <div className="mt-2 border-y border-[#ced2d7] py-3">
            <audio ref={audioRef} src={src} preload="metadata" />
            <div className="flex flex-wrap items-center gap-2">
                {/* Play / Pause */}
                <button
                    onClick={toggle}
                    className="ui-icon bg-[#25272b] !text-[#f7f8f9]"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                </button>

                {/* Timeline */}
                <div className="min-w-[100px] flex-1">
                    <input
                        type="range"
                        aria-label="Playback position"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={Math.min(time, duration || 0)}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full accent-[#25272b]"
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
                        className="ui-icon"
                        aria-label={volume ? "Mute" : "Unmute"}
                    >
                        {volume ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                    </button>
                    <input
                        type="range"
                        aria-label="Volume"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => setVol(parseFloat(e.target.value))}
                        className="w-20 accent-[#25272b]"
                    />
                </div>

                {/* Speed / Download / Close */}
                <div className="flex items-center gap-2">
                    <select
                        value={rate}
                        onChange={(e) => setPlayback(parseFloat(e.target.value))}
                        className="min-h-11 rounded-lg border border-[#ced2d7] bg-transparent px-2 text-sm"
                        aria-label="Playback speed"
                    >
                        {[0.75, 1, 1.25, 1.5].map((r) => (
                            <option key={r} value={r}>{r}×</option>
                        ))}
                    </select>

                    <a
                        href={src}
                        download
                        className="ui-icon"
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
                            className="ui-icon"
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
