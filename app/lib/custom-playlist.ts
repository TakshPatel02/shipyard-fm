import { Track } from "./music-data";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CUSTOM_PLAYLIST_KEY = "shipyard-fm-custom-playlist";

const IMPORT_MAX_TRACKS = 500;
const IMPORT_SCHEMA_VERSION = 1;

// ─── YouTube URL Parser ───────────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from any common YouTube URL format.
 * Supports:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *
 * Returns null if the URL doesn't match any known format.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  // Pattern covers all 4 known YouTube URL formats
  const pattern =
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = trimmed.match(pattern);
  return match ? match[1] : null;
}

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

/**
 * Reads the custom playlist from LocalStorage.
 * Returns an empty array on any error (missing key, bad JSON, wrong shape).
 */
export function loadCustomTracks(): Track[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PLAYLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any malformed entries that may have been written incorrectly
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        item.id.length > 0 &&
        typeof item.title === "string" &&
        item.title.length > 0 &&
        typeof item.artist === "string"
    ) as Track[];
  } catch {
    return [];
  }
}

/**
 * Persists the custom playlist to LocalStorage.
 * Silently ignores quota or security errors.
 */
export function saveCustomTracks(tracks: Track[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_PLAYLIST_KEY, JSON.stringify(tracks));
  } catch {
    // Ignore quota exceeded or blocked storage errors
  }
}

// ─── Import Validator ─────────────────────────────────────────────────────────

export interface ImportPayload {
  version: number;
  tracks: Track[];
}

/**
 * Validates raw JSON data against the Shipyard playlist import schema.
 * Throws a descriptive Error if validation fails.
 * Returns a typed ImportPayload on success.
 *
 * Expected schema:
 * {
 *   "version": 1,
 *   "tracks": [
 *     { "id": "VIDEO_ID", "title": "Song Name", "artist": "Artist Name" }
 *   ]
 * }
 */
export function validateImportData(raw: unknown): ImportPayload {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid file: expected a JSON object at the root.");
  }

  const data = raw as Record<string, unknown>;

  if (data.version !== IMPORT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported version: expected version ${IMPORT_SCHEMA_VERSION}, got ${data.version ?? "none"}.`
    );
  }

  if (!Array.isArray(data.tracks)) {
    throw new Error('Invalid file: "tracks" must be an array.');
  }

  if (data.tracks.length > IMPORT_MAX_TRACKS) {
    throw new Error(
      `Too many tracks: limit is ${IMPORT_MAX_TRACKS}, got ${data.tracks.length}.`
    );
  }

  const validated: Track[] = [];

  for (let i = 0; i < data.tracks.length; i++) {
    const item = data.tracks[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Track at index ${i} is not a valid object.`);
    }
    const track = item as Record<string, unknown>;

    if (typeof track.id !== "string" || track.id.trim().length === 0) {
      throw new Error(`Track at index ${i} has a missing or invalid "id".`);
    }
    if (typeof track.title !== "string" || track.title.trim().length === 0) {
      throw new Error(`Track at index ${i} has a missing or invalid "title".`);
    }
    if (typeof track.artist !== "string") {
      throw new Error(`Track at index ${i} has an invalid "artist" field.`);
    }

    validated.push({
      id: track.id.trim(),
      title: track.title.trim(),
      artist: track.artist.trim(),
    });
  }

  return { version: IMPORT_SCHEMA_VERSION, tracks: validated };
}

// ─── Export Helper ────────────────────────────────────────────────────────────

/**
 * Serializes the given tracks into the Shipyard export format.
 * Returns a JSON string ready to be written to a file.
 */
export function buildExportJson(tracks: Track[]): string {
  const payload: ImportPayload = {
    version: IMPORT_SCHEMA_VERSION,
    tracks,
  };
  return JSON.stringify(payload, null, 2);
}
