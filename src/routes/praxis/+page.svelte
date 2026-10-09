<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import PageIntro from '#lib/components/PageIntro.svelte';
	import { fullSizeUrl, requireImage } from '#lib/images.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const page = $derived(data.content);
	const lang = $derived(page.translated ? undefined : page.contentLang);
	const items = $derived(
		page.data.gallery.map((item) => ({ ...item, picture: requireImage(`practice/${item.image}`) }))
	);
</script>

<PageIntro
	title={page.data.title}
	eyebrow={m.nav_practice()}
	translated={page.translated}
	contentLang={page.contentLang}
/>

<div class="section">
	<div class="container" {lang}>
		{#if page.html}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
			<div class="prose intro">{@html page.html}</div>
		{/if}
		<ul class="gallery">
			{#each items as item, i (item.image)}
				<li>
					<figure>
						<a href={fullSizeUrl(item.picture)} class="frame">
							<enhanced:img
								src={item.picture}
								alt={item.alt}
								sizes="(min-width: 56rem) 36rem, (min-width: 36rem) 46vw, 92vw"
								loading={i < 3 ? 'eager' : 'lazy'}
								fetchpriority={i === 0 ? 'high' : undefined}
							/>
							<span class="visually-hidden">{m.gallery_full_size()}</span>
						</a>
						<figcaption>{item.caption}</figcaption>
					</figure>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.intro {
		margin-bottom: var(--space-5);
		color: var(--color-muted);
	}

	.gallery {
		display: grid;
		gap: var(--space-5) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (min-width: 36rem) {
		.gallery {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Two columns: an odd last photo spans both instead of leaving an empty cell */
	@media (min-width: 36rem) and (max-width: 55.99rem) {
		.gallery li:last-child:nth-child(odd) {
			grid-column: 1 / -1;
		}
		.gallery li:last-child:nth-child(odd) .frame :global(img) {
			aspect-ratio: 16 / 9;
		}
	}

	/* 3 + 2 layout on wide screens: first row thirds, second row halves */
	@media (min-width: 56rem) {
		.gallery {
			grid-template-columns: repeat(6, 1fr);
		}
		.gallery li {
			grid-column: span 2;
		}
		.gallery li:nth-child(5n + 4),
		.gallery li:nth-child(5n + 5) {
			grid-column: span 3;
		}
	}

	figure {
		display: flex;
		flex-direction: column;
		height: 100%;
		margin: 0;
	}

	.frame {
		display: block;
		overflow: hidden;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		background: var(--color-tint);
	}

	.frame :global(img) {
		width: 100%;
		height: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	@media (prefers-reduced-motion: no-preference) {
		.frame:hover :global(img) {
			transform: scale(1.02);
		}
	}

	figcaption {
		margin-top: var(--space-2);
		font-weight: 600;
		color: var(--color-heading);
	}
</style>
