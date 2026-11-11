import Link from 'next/link';
import { getShowsWithCounts } from '@/lib/shows';

export const dynamic = 'force-dynamic';

const CARD_ACCENTS = [
    {
        glow: 'from-amber-400/35 via-pink-500/25 to-yellow-500/35',
        borderHover: 'group-hover:border-amber-400/70',
        shadowHover: 'group-hover:shadow-[0_20px_60px_-10px_rgba(251,191,36,0.35)]',
        badge: 'bg-amber-400 text-black',
        buttonHover: 'group-hover:bg-amber-400 group-hover:text-black group-hover:border-amber-300',
    },
    {
        glow: 'from-cyan-400/35 via-fuchsia-500/25 to-emerald-400/35',
        borderHover: 'group-hover:border-cyan-400/70',
        shadowHover: 'group-hover:shadow-[0_20px_60px_-10px_rgba(34,211,238,0.35)]',
        badge: 'bg-cyan-400 text-black',
        buttonHover: 'group-hover:bg-cyan-400 group-hover:text-black group-hover:border-cyan-300',
    },
    {
        glow: 'from-violet-500/35 via-rose-500/25 to-indigo-400/35',
        borderHover: 'group-hover:border-violet-400/70',
        shadowHover: 'group-hover:shadow-[0_20px_60px_-10px_rgba(167,139,250,0.35)]',
        badge: 'bg-violet-400 text-black',
        buttonHover: 'group-hover:bg-violet-400 group-hover:text-black group-hover:border-violet-300',
    },
];

export default function HomePage() {
    const shows = getShowsWithCounts();

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#06060a] text-white flex flex-col justify-between px-6 py-12 md:px-14 md:py-16">
            {/* ── Ambient Flashy Background Glows ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 overflow-hidden z-0"
            >
                <div className="animate-float-slow absolute -top-32 -left-24 h-[460px] w-[460px] rounded-full bg-amber-500/15 blur-[130px]" />
                <div
                    className="animate-float-slow absolute top-1/4 -right-24 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[140px]"
                    style={{ animationDelay: '-4s' }}
                />
                <div
                    className="animate-float-slow absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-600/15 blur-[140px]"
                    style={{ animationDelay: '-2s' }}
                />
                {/* Subtle radial vignette + grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
            </div>

            {/* ── Header Section ── */}
            <header className="relative z-10 max-w-6xl w-full mx-auto text-center mt-2 mb-10 md:mb-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-5 shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
                        Random Episode Roulette
                    </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-sm">
                    Pick Your Show
                </h1>
                <p className="mt-4 text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-normal">
                    Select a show to jump straight into a random episode.
                </p>
            </header>

            {/* ── Show Selection Grid ── */}
            <section className="relative z-10 max-w-6xl w-full mx-auto my-auto">
                {shows.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-10 text-center max-w-lg mx-auto backdrop-blur-md">
                        <p className="text-lg font-semibold text-white mb-2">
                            No shows configured
                        </p>
                        <p className="text-sm text-zinc-400">
                            Add your shows to{' '}
                            <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200">
                                shows.json
                            </code>{' '}
                            in the project root to get started.
                        </p>
                    </div>
                ) : (
                    <div
                        className={`grid gap-8 sm:gap-10 ${
                            shows.length === 1
                                ? 'grid-cols-1 max-w-xl mx-auto'
                                : shows.length === 2
                                  ? 'grid-cols-1 md:grid-cols-2'
                                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        }`}
                    >
                        {shows.map((show, idx) => {
                            const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                            return (
                                <Link
                                    key={show.path}
                                    href={`/${show.path}`}
                                    className="group relative block rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
                                >
                                    {/* Ambient outer glow on hover */}
                                    <div
                                        className={`absolute -inset-1 rounded-[28px] bg-gradient-to-r ${accent.glow} opacity-0 blur-xl transition duration-500 group-hover:opacity-100`}
                                        aria-hidden="true"
                                    />

                                    {/* Card container */}
                                    <div
                                        className={`relative h-full overflow-hidden rounded-3xl border border-white/15 bg-zinc-900/90 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.015] ${accent.borderHover} ${accent.shadowHover}`}
                                    >
                                        {/* 16:9 Artwork Wrapper */}
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={show.image}
                                                alt={show.title}
                                                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                                            />

                                            {/* Glossy diagonal shimmer sweep on hover */}
                                            <div
                                                aria-hidden="true"
                                                className="card-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100"
                                            />

                                            {/* Rich bottom gradient fade into title bar */}
                                            <div
                                                aria-hidden="true"
                                                className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent"
                                            />

                                            {/* Top badges */}
                                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                                                <span className="rounded-full bg-black/60 border border-white/15 px-3 py-1 text-xs font-mono text-zinc-200 backdrop-blur-md">
                                                    /{show.path}
                                                </span>

                                                {show.videoCount !== null && (
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-md ${accent.badge}`}
                                                    >
                                                        {show.videoCount}{' '}
                                                        {show.videoCount === 1 ? 'Episode' : 'Episodes'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Center floating play button on hover */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 border border-white/30 text-white backdrop-blur-md shadow-2xl transition-all duration-300 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="w-7 h-7 translate-x-0.5"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer: Title + Action */}
                                        <div className="relative flex items-center justify-between gap-4 px-7 py-6 bg-zinc-950/90">
                                            <div className="min-w-0">
                                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
                                                    {show.title}
                                                </h2>
                                            </div>

                                            <div
                                                className={`shrink-0 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide text-white transition-all duration-300 ${accent.buttonHover}`}
                                            >
                                                <span>Play</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Footer Hint ── */}
            <footer className="relative z-10 max-w-6xl w-full mx-auto text-center mt-12 text-xs text-zinc-500">
                Configured via <code className="text-zinc-400">shows.json</code>
            </footer>
        </main>
    );
}
