import fs from 'fs';
import path from 'path';

export const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v']);

export interface ShowConfig {
    path: string;
    title: string;
    image: string;
    folder: string;
}

export interface ShowWithCount extends ShowConfig {
    videoCount: number | null;
}

export function normalizeShowPath(rawPath: string): string {
    return rawPath.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

export function getShows(): ShowConfig[] {
    const configPath = path.join(process.cwd(), 'shows.json');

    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (item): item is ShowConfig =>
                    typeof item === 'object' &&
                    item !== null &&
                    typeof item.path === 'string' &&
                    typeof item.title === 'string' &&
                    typeof item.image === 'string' &&
                    typeof item.folder === 'string'
            )
            .map((item) => ({
                path: normalizeShowPath(item.path),
                title: item.title.trim(),
                image: item.image.trim(),
                folder: item.folder.trim(),
            }));
    } catch {
        return [];
    }
}

export function getShowByPath(showPath: string): ShowConfig | undefined {
    const normalized = normalizeShowPath(showPath);
    return getShows().find((s) => s.path === normalized);
}

/**
 * Recursively scans directory and returns relative paths to all supported video files
 * using forward slashes (e.g. "S02/Futurama.S02E04.mkv" or "01x01.mp4").
 */
export function scanVideoFiles(dirPath: string): string[] {
    const results: string[] = [];

    function walk(currentDir: string, relativePrefix: string) {
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;

            const fullPath = path.join(currentDir, entry.name);
            const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                walk(fullPath, relPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (VIDEO_EXTENSIONS.has(ext)) {
                    results.push(relPath);
                }
            }
        }
    }

    walk(dirPath, '');
    return results;
}

export function getShowsWithCounts(): ShowWithCount[] {
    return getShows().map((show) => {
        try {
            const absDir = path.resolve(show.folder);
            if (!fs.existsSync(absDir)) {
                return { ...show, videoCount: null };
            }
            const count = scanVideoFiles(absDir).length;
            return { ...show, videoCount: count };
        } catch {
            return { ...show, videoCount: null };
        }
    });
}
