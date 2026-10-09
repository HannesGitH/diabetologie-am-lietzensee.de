/**
 * All content images, processed by @sveltejs/enhanced-img (AVIF/WebP + fallback, intrinsic sizes).
 * Content files refer to images by file name (e.g. `photo: valentina-byckov.jpg`), matched
 * case-insensitively, so `Anna.JPG` from a phone camera works as well.
 */
import type { Picture } from '@sveltejs/enhanced-img';

/*
 * Explicit widths make enhanced-img emit width descriptors (`500w`) instead of `1x, 2x`, so the
 * `sizes` attribute on each <enhanced:img> takes effect and 1x screens get the full-resolution
 * file instead of a half-size copy. Widths larger than an original are clamped to the original
 * (no upscaling); the resulting duplicates are removed below.
 */
const modules = import.meta.glob<Picture>(
	'/src/lib/assets/images/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,Jpg,Jpeg,Png,Webp}',
	{
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '2400;1600;1200;800;600;400;250' }
	}
);

const ROOT = '/src/lib/assets/images/';

/** Drop srcset candidates that repeat an earlier width (from clamped widths). */
function dedupeSrcset(srcset: string): string {
	const seen = new Set<string>();
	return srcset
		.split(/,\s+/)
		.filter((candidate) => {
			const [url, descriptor = ''] = candidate.trim().split(/\s+/);
			const key = descriptor || url;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.join(', ');
}

function normalise(picture: Picture): Picture {
	return {
		...picture,
		sources: Object.fromEntries(
			Object.entries(picture.sources).map(([format, srcset]) => [format, dedupeSrcset(srcset)])
		)
	};
}

const byName = new Map<string, Picture>();
const allPaths: string[] = [];
for (const [path, picture] of Object.entries(modules)) {
	const relative = path.slice(ROOT.length);
	const normalised = normalise(picture);
	allPaths.push(relative);
	byName.set(relative.toLowerCase(), normalised);
	const base = relative.split('/').pop()!.toLowerCase();
	if (!byName.has(base)) byName.set(base, normalised);
}

/** Look up an image by file name (`flur.jpg`) or folder path (`practice/flur.jpg`). */
export function getImage(name: string | undefined | null): Picture | undefined {
	if (!name) return undefined;
	return byName.get(name.trim().toLowerCase());
}

/** Like getImage, but fails the build with a helpful message if the file does not exist. */
export function requireImage(name: string, folder?: string): Picture {
	const path = folder && !name.includes('/') ? `${folder}/${name}` : name;
	const picture = getImage(path);
	if (!picture) {
		const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
		const candidates = allPaths.filter((p) => (dir ? p.startsWith(dir) : true));
		throw new Error(
			`[content] Bild „${path}“ wurde nicht gefunden in src/lib/assets/images/${dir}. ` +
				`Vorhanden sind: ${candidates.map((p) => p.slice(dir.length)).join(', ') || '(keine Bilder)'}. ` +
				'Schreibweise prüfen (Groß-/Kleinschreibung ist egal).'
		);
	}
	return picture;
}

/** Original (largest) URL of an image, e.g. for "open full size" links. */
export function fullSizeUrl(picture: Picture): string {
	return picture.img.src;
}
