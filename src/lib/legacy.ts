import legacyPages from './legacy.json';

/**
 * Page names of the old website (…/kontakt.html) mapped to the new paths.
 * The JSON file is also read by scripts/postbuild.js to write host redirect files (301).
 */
export const LEGACY_PAGES: Record<string, string> = legacyPages;
