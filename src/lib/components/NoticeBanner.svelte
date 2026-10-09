<script lang="ts">
	import { baseLocale } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { Notice } from '#lib/types.js';
	import Icon from './Icon.svelte';

	let { notice }: { notice: Notice } = $props();
	const id = 'notice-title';
	const lang = $derived(notice.translated ? undefined : baseLocale);
</script>

<aside class="notice notice-{notice.tone}" aria-labelledby={id}>
	<span class="notice-icon"
		><Icon name={notice.tone === 'warning' ? 'alert' : 'info'} size={22} /></span
	>
	<div class="notice-body">
		<!-- A title from the (German fallback) file carries its language; the default label does not. -->
		<p class="notice-title" {id} lang={notice.title ? lang : undefined}>
			{notice.title ?? m.notice_label()}
		</p>
		{#if !notice.translated}
			<p class="notice-untranslated">{m.notice_not_translated()}</p>
		{/if}
		<div {lang}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
			{@html notice.html}
		</div>
	</div>
</aside>

<style>
	.notice {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: start;
		gap: var(--space-3) var(--space-4);
		padding: var(--space-5);
		border: 1px solid var(--color-border-strong);
		border-left: 4px solid var(--color-accent);
		border-radius: var(--radius);
		background: var(--color-tint);
	}

	.notice-warning {
		background: var(--color-warning-bg);
		border-color: var(--color-warning-border);
		border-left-color: var(--color-warning-text);
		color: var(--color-warning-text);
	}

	.notice-icon {
		display: inline-flex;
		color: var(--color-accent-text);
		padding-top: 0.1rem;
	}

	.notice-warning .notice-icon {
		color: var(--color-warning-text);
	}

	.notice-title {
		margin: 0 0 var(--space-2);
		font-weight: 650;
		color: var(--color-heading);
	}

	.notice-warning .notice-title {
		color: inherit;
	}

	.notice-body {
		max-width: var(--measure);
	}

	.notice-untranslated {
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.notice-warning .notice-untranslated {
		color: inherit;
	}

	.notice-body :global(p) {
		margin: 0 0 var(--space-2);
	}

	.notice-body :global(:last-child) {
		margin-bottom: 0;
	}

	.notice-warning :global(a) {
		color: inherit;
	}
</style>
