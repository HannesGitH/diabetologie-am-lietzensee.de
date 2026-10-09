<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, locales } from '#lib/paraglide/runtime.js';
	import { LOCALE_NAMES, localizedPath, NAV_ITEMS } from '#lib/site.js';

	let { status = 404, message }: { status?: number; message?: string } = $props();
	const current = getLocale();
	const others = locales.filter((locale) => locale !== current);
</script>

<section class="section">
	<div class="container narrow">
		<p class="code" aria-hidden="true">{status}</p>
		<h1>{status === 404 ? m.error_title() : m.error_generic()}</h1>
		{#if status === 404}
			<p class="lead">{m.error_text()}</p>
		{:else if message}
			<p class="lead">{message}</p>
		{/if}
		<ul class="links">
			{#each NAV_ITEMS as item (item.slug)}
				<li><a href={localizedPath(item.slug)}>{item.label()}</a></li>
			{/each}
		</ul>
		{#if status === 404}
			<div class="others">
				{#each others as locale (locale)}
					<p lang={locale}>
						<strong>{m.error_title({}, { locale })}</strong> —
						<a href={localizedPath('home', locale)} hreflang={locale}
							>{m.back_home({}, { locale })} ({LOCALE_NAMES[locale]})</a
						>
					</p>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.narrow {
		max-width: 46rem;
	}

	.code {
		margin: 0 0 var(--space-2);
		font-size: clamp(3.5rem, 2rem + 8vw, 6rem);
		font-weight: 300;
		line-height: 1;
		color: var(--color-accent-text);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: var(--space-5) 0;
		padding: 0;
		list-style: none;
	}

	.links a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding-inline: var(--space-4);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius);
		text-decoration: none;
		font-weight: 600;
	}

	.links a:hover {
		background: var(--color-tint);
	}

	.others {
		margin-top: var(--space-6);
		padding-top: var(--space-5);
		border-top: 1px solid var(--color-border);
		color: var(--color-muted);
	}
</style>
