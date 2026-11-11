'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type State =
    | { status: 'loading' }
    | { status: 'playing'; filename: string }
    | { status: 'error'; message: string };

interface VideoPlayerProps {
    show: string;
    title: string;
}

export default function VideoPlayer({ show, title }: VideoPlayerProps) {
    const [state, setState] = useState<State>({ status: 'loading' });
    const [buttonVisible, setButtonVisible] = useState(true);
    const [allVideos, setAllVideos] = useState<string[]>([]);
    const [hintVisible, setHintVisible] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetHideTimer = useCallback(() => {
        setButtonVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setButtonVisible(false), 3000);
    }, []);

    // Hide scroll hint after 5s, permanently
    useEffect(() => {
        const t = setTimeout(() => setHintVisible(false), 5000);
        return () => clearTimeout(t);
    }, []);

    // Clean up hideTimer on unmount
    useEffect(() => {
        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    // Fetch all video filenames for this show once on mount
    useEffect(() => {
        fetch(`/api/videos?show=${encodeURIComponent(show)}`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data.filenames)) setAllVideos(data.filenames);
            })
            .catch(() => {});
    }, [show]);

    const loadRandomVideo = useCallback(async () => {
        setState({ status: 'loading' });
        try {
            const res = await fetch(`/api/random-video?show=${encodeURIComponent(show)}`, {
                cache: 'no-store',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Unknown error');
            setState({ status: 'playing', filename: data.filename });
            resetHideTimer();
        } catch (err) {
            setState({ status: 'error', message: (err as Error).message });
        }
    }, [show, resetHideTimer]);

    function loadVideo(filename: string) {
        setState({ status: 'playing', filename });
        resetHideTimer();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/random-video?show=${encodeURIComponent(show)}`, {
            cache: 'no-store',
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? 'Unknown error');
                if (!cancelled) {
                    setState({ status: 'playing', filename: data.filename });
                    resetHideTimer();
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({ status: 'error', message: (err as Error).message });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [show, resetHideTimer]);

    // When a new filename arrives, attempt autoplay
    useEffect(() => {
        if (state.status === 'playing' && videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    }, [state]);

    const videoSrc =
        state.status === 'playing'
            ? `/api/video?show=${encodeURIComponent(show)}&file=${encodeURIComponent(state.filename)}`
            : undefined;
    const currentFilename = state.status === 'playing' ? state.filename : null;

    return (
        <main className="w-screen bg-black">
            {/* ── Section 1: Fullscreen player ── */}
            <section
                onMouseMove={resetHideTimer}
                className="relative w-full h-screen overflow-hidden"
            >
                {/* Video element */}
                {videoSrc && (
                    <video
                        ref={videoRef}
                        key={videoSrc}
                        src={videoSrc}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                        aria-label={`${title} random video player`}
                    />
                )}

                {/* Overlay for loading / error states */}
                {state.status !== 'playing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 px-6">
                        {state.status === 'loading' && (
                            <p className="text-lg tracking-wide opacity-70">Loading {title}…</p>
                        )}
                        {state.status === 'error' && (
                            <>
                                <p className="text-red-400 text-lg font-medium">Error</p>
                                <p className="text-sm opacity-70 max-w-md text-center">{state.message}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <button
                                        onClick={loadRandomVideo}
                                        className="px-4 py-2 rounded-lg border border-white/30 text-sm hover:bg-white/10 transition cursor-pointer"
                                    >
                                        Retry
                                    </button>
                                    <Link
                                        href="/"
                                        className="px-4 py-2 rounded-lg bg-white/15 border border-white/25 text-sm hover:bg-white/25 transition"
                                    >
                                        Back to Shows
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* "Back to Shows" button (top-left) */}
                <div
                    onMouseMove={resetHideTimer}
                    onMouseEnter={resetHideTimer}
                    className="absolute top-0 left-0 w-64 h-24 z-10 pointer-events-auto"
                >
                    <Link
                        href="/"
                        title="Back to show selection"
                        style={{
                            padding: '10px 18px',
                            opacity: state.status === 'playing' ? (buttonVisible ? 1 : 0) : 1,
                            transition: 'opacity 0.6s ease',
                        }}
                        className="group absolute top-5 left-5 flex items-center gap-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white text-sm font-semibold tracking-wide backdrop-blur-md shadow-xl"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
                        >
                            <path
                                fillRule="evenodd"
                                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>Shows</span>
                        <span className="text-white/40 font-normal">|</span>
                        <span className="text-white/80 font-medium truncate max-w-[120px]">{title}</span>
                    </Link>
                </div>

                {/* "Next video" button (top-right) */}
                {state.status === 'playing' && (
                    <div
                        onMouseMove={resetHideTimer}
                        onMouseEnter={resetHideTimer}
                        className="absolute top-0 right-0 w-40 h-24 z-10"
                    >
                        <button
                            onClick={loadRandomVideo}
                            title="Load next random video"
                            style={{
                                padding: '10px 20px',
                                opacity: buttonVisible ? 1 : 0,
                                transition: 'opacity 0.6s ease',
                            }}
                            className="group absolute top-5 right-5 flex items-center gap-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white text-sm font-semibold tracking-wide backdrop-blur-md shadow-xl cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                            >
                                <path d="M3.288 4.819A1.5 1.5 0 0 0 1 6.095v7.81a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905a1.5 1.5 0 0 0 0-2.552L3.288 4.819ZM10.288 4.819A1.5 1.5 0 0 0 8 6.095v7.81a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905a1.5 1.5 0 0 0 0-2.552l-6.323-3.905Z" />
                            </svg>
                            Next
                        </button>
                    </div>
                )}

                {/* Filename label */}
                {state.status === 'playing' && (
                    <p className="absolute bottom-16 left-4 text-white/50 text-xs truncate max-w-[60vw] pointer-events-none">
                        {state.filename}
                    </p>
                )}

                {/* Scroll hint chevron */}
                {allVideos.length > 0 && (
                    <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
                        style={{ opacity: hintVisible ? 1 : 0, transition: 'opacity 0.8s ease' }}
                        aria-hidden="true"
                    >
                        <span className="text-white/50 text-xs tracking-widest uppercase">All videos</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5 text-white/40 animate-bounce"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </section>

            {/* ── Section 2: Video list ── */}
            {allVideos.length > 0 && (
                <section className="w-full bg-zinc-900" style={{ padding: '40px 24px' }}>
                    {/* Header */}
                    <div className="flex items-baseline" style={{ gap: '12px', marginBottom: '24px' }}>
                        <h2 className="text-white text-xl font-semibold tracking-wide">
                            {title} — All Videos
                        </h2>
                        <span className="text-zinc-500 text-sm">{allVideos.length} files</span>
                    </div>

                    {/* 2-column grid */}
                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                        {allVideos.map((filename) => {
                            const isPlaying = filename === currentFilename;
                            return (
                                <button
                                    key={filename}
                                    onClick={() => loadVideo(filename)}
                                    title={filename}
                                    style={{ padding: '16px 20px' }}
                                    className={[
                                        'w-full text-left rounded-xl transition cursor-pointer',
                                        'bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98]',
                                        isPlaying ? 'ring-2 ring-white/60 text-white' : 'text-zinc-300',
                                    ].join(' ')}
                                >
                                    <div className="flex items-center" style={{ gap: '12px' }}>
                                        {/* Playing indicator */}
                                        {isPlaying ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="w-4 h-4 shrink-0 text-white"
                                            >
                                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="w-4 h-4 shrink-0 text-zinc-500"
                                            >
                                                <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1Z" />
                                            </svg>
                                        )}
                                        <span className="truncate text-sm font-medium leading-snug">{filename}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    );
}
