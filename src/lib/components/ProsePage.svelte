<script lang="ts">
	import PageIntro from './PageIntro.svelte';
	import type { PageContent } from '#lib/types.js';

	let { page }: { page: PageContent<{ title: string }> } = $props();
	const lang = $derived(page.translated ? undefined : page.contentLang);
</script>

<PageIntro title={page.data.title} translated={page.translated} contentLang={page.contentLang} />

<div class="section">
	<div class="container">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
		<article class="prose legal" {lang}>{@html page.html}</article>
	</div>
</div>

<style>
	.legal {
		font-size: var(--text-base);
	}

	.legal :global(h2) {
		font-size: var(--text-xl);
	}

	.legal :global(h3) {
		font-size: var(--text-lg);
	}
</style>
