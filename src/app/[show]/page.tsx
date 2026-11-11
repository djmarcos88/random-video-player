import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import { getShowByPath } from '@/lib/shows';

export const dynamic = 'force-dynamic';

export default async function ShowPlayerPage({
    params,
}: {
    params: Promise<{ show: string }>;
}) {
    const { show: showSlug } = await params;
    const showConfig = getShowByPath(showSlug);

    if (!showConfig) {
        return (
            <main className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl bg-zinc-900/90 border border-white/10 p-8 text-center shadow-2xl">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                        404 • Show Not Found
                    </p>
                    <h1 className="text-2xl font-bold mb-3">
                        &ldquo;{showSlug}&rdquo; isn&apos;t in shows.json
                    </h1>
                    <p className="text-zinc-400 text-sm mb-6">
                        Check your <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">shows.json</code> configuration or pick one of the available shows.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full bg-white text-black font-semibold text-sm px-6 py-3 hover:bg-zinc-200 transition"
                    >
                        ← Back to Show Selection
                    </Link>
                </div>
            </main>
        );
    }

    return <VideoPlayer show={showConfig.path} title={showConfig.title} />;
}
