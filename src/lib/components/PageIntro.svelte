<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { Locale } from '#lib/paraglide/runtime.js';
	import Icon from './Icon.svelte';

	let {
		title,
		eyebrow,
		translated = true,
		contentLang
	}: {
		title: string;
		eyebrow?: string;
		translated?: boolean;
		contentLang?: Locale;
	} = $props();
</script>

<header class="page-intro">
	<div class="container">
		{#if !translated}
			<p class="untranslated"><Icon name="globe" size={18} />{m.not_translated()}</p>
		{/if}
		{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
		<h1 lang={translated ? undefined : contentLang}>{title}</h1>
	</div>
</header>

<style>
	.page-intro {
		padding-block: clamp(2.25rem, 1.5rem + 3vw, 4rem) clamp(1.75rem, 1.25rem + 2vw, 3rem);
		background:
			radial-gradient(120% 140% at 100% 0%, var(--color-highlight) 0%, transparent 55%),
			var(--color-tint);
		border-bottom: 1px solid var(--color-border);
	}

	h1 {
		margin-bottom: 0;
		max-width: 30ch;
	}

	.untranslated {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-4);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}
</style>
