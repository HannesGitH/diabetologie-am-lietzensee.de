<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { m } from '#lib/paraglide/messages.js';
	import Icon from './Icon.svelte';

	/**
	 * Link that opens in a new tab. Always shows the "external" arrow, so sighted users know
	 * in advance; screen readers get "(opens in a new tab)".
	 */
	let { href, children, ...rest }: HTMLAnchorAttributes & { href: string; children: Snippet } =
		$props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" {...rest}
	>{@render children()}<Icon name="external" size="0.85em" class="ext-icon" /><span
		class="visually-hidden">{` ${m.opens_new_tab()}`}</span
	></a
>
