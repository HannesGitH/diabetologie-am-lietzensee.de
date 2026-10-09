<script lang="ts">
	let { size = 40 }: { size?: number } = $props();
</script>

<!-- Medical bag + stethoscope, redrawn from the original logo in brand green. Decorative. -->
<svg
	class="logo"
	width={size}
	height={size}
	viewBox="0 0 48 48"
	aria-hidden="true"
	focusable="false"
>
	<path
		d="M12 14v-3.5A2.5 2.5 0 0 1 14.5 8h5a2.5 2.5 0 0 1 2.5 2.5V14"
		fill="none"
		stroke="var(--logo-soft, #9cbf8f)"
		stroke-width="3"
	/>
	<rect x="3" y="14" width="28" height="21" rx="4.5" fill="var(--logo-main, #5b7f4f)" />
	<path
		d="M14.6 18.5h4.8v4.6H24v4.8h-4.6v4.6h-4.8v-4.6H10v-4.8h4.6z"
		fill="var(--logo-cross, #fff)"
	/>
	<path
		d="M37 4.5v7a4 4 0 0 0 8 0v-7M41 15.5V31a8 8 0 0 1-8 8h-1"
		fill="none"
		stroke="var(--logo-main, #5b7f4f)"
		stroke-width="2.6"
		stroke-linecap="round"
	/>
	<circle
		cx="28.5"
		cy="39"
		r="3.4"
		fill="var(--logo-cross, #fff)"
		stroke="var(--logo-main, #5b7f4f)"
		stroke-width="2.6"
	/>
</svg>

<style>
	.logo {
		flex: none;
	}
	@media (prefers-color-scheme: dark) {
		.logo {
			--logo-main: #a6f78c;
			--logo-soft: #5b7f4f;
			--logo-cross: #121a13;
		}
	}
</style>
