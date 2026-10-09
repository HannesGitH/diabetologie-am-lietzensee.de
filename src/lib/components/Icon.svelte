<script lang="ts" module>
	const PATHS = {
		phone:
			'<path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
		mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
		pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
		calendar:
			'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
		external:
			'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
		fax: '<path d="M7 9V3.5h8l2 2V9"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M7 15h10v5.5H7z"/>',
		menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
		close: '<path d="M6 6l12 12M18 6 6 18"/>',
		arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
		alert: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.2"/>',
		globe:
			'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
		route:
			'<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7.8"/>',
		heart:
			'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
		mother:
			'<circle cx="12" cy="5.5" r="2.5"/><path d="M9 21v-5.5L7.5 11a4.5 4.5 0 0 1 9 0c0 2.7-1.6 4.5-3.5 4.5H12V21"/>',
		foot: '<path d="M8.5 21c-2.3 0-3.5-1.7-3.5-4 0-3 2-4.5 2-8 0-2.5 1.2-4 3-4s3 1.5 3 4.3c0 4-1.5 5.3-1.5 7.7 0 2.3-.7 4-3 4z"/><circle cx="16" cy="5" r="1.3"/><circle cx="18.6" cy="7.6" r="1.1"/><circle cx="19.6" cy="10.8" r="1"/>',
		drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>'
	} as const;
	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	let {
		name,
		size = 20,
		label,
		class: className = ''
	}: { name: IconName; size?: number | string; label?: string; class?: string } = $props();
</script>

<svg
	class="icon {className}"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, hard-coded SVG paths -->
	{@html PATHS[name]}
</svg>

<style>
	.icon {
		display: inline-block;
		flex: none;
		vertical-align: middle;
	}
</style>
