<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import ExternalLink from '#lib/components/ExternalLink.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PageIntro from '#lib/components/PageIntro.svelte';
	import { localizedPath, phoneText } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const page = $derived(data.content);
	const lang = $derived(page.translated ? undefined : page.contentLang);
</script>

<PageIntro
	title={page.data.title}
	eyebrow={m.nav_services()}
	translated={page.translated}
	contentLang={page.contentLang}
/>

<div class="section">
	<div class="container" {lang}>
		{#if page.html}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
			<div class="prose intro">{@html page.html}</div>
		{/if}
		<div class="groups">
			{#each page.data.groups as group, gi (group.title)}
				<section class="card group" aria-labelledby="group-{gi}">
					<h2 id="group-{gi}">{group.title}</h2>
					<ul>
						{#each group.items as item, i (i)}
							<li><Icon name="check" size={20} class="tick" /><span>{item}</span></li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	</div>
</div>

<section class="section section-tint cta" aria-labelledby="cta-title">
	<div class="container cta-inner">
		<div>
			<h2 id="cta-title">{m.book_online_long()}</h2>
			<p class="muted">
				{m.phone()}: {#each data.practice.phones as phone, i (phone.tel)}{#if i > 0}
						{m.or()}
					{/if}<a href="tel:{phone.tel}">{phoneText(phone)}</a>{/each}
			</p>
		</div>
		<div class="btn-row">
			<ExternalLink href={data.practice.bookingUrl} class="btn btn-primary">
				<Icon name="calendar" size={18} />{m.book_online()}
			</ExternalLink>
			<a class="btn btn-secondary" href={localizedPath('kontakt')}>{m.nav_contact()}</a>
		</div>
	</div>
</section>

<style>
	.intro {
		margin-bottom: var(--space-6);
	}

	/* minmax(0, …): long words must not widen the columns beyond the screen (400 % zoom) */
	.groups {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
	}

	@media (min-width: 56rem) {
		.groups {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
		}
	}

	.group h2 {
		font-size: var(--text-xl);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.group ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.group li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-3);
		padding-block: var(--space-2);
	}

	/* "Gesundheitsvorsorgeuntersuchungen" must be able to break on narrow screens */
	.group li span {
		overflow-wrap: anywhere;
		hyphens: auto;
	}

	.group li :global(.tick) {
		margin-top: 0.2rem;
		color: var(--color-decor);
	}

	.cta-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-5);
	}

	.cta h2 {
		font-size: var(--text-xl);
		margin-bottom: var(--space-2);
	}

	.cta p {
		margin: 0;
	}
</style>
