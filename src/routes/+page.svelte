<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import ExternalLink from '#lib/components/ExternalLink.svelte';
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import NoticeBanner from '#lib/components/NoticeBanner.svelte';
	import OpeningHours from '#lib/components/OpeningHours.svelte';
	import { requireImage } from '#lib/images.js';
	import { cityLine, localizedPath, phoneText } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = getLocale();
	const home = $derived(data.content.data);
	const practice = $derived(data.practice);
	const contentLang = $derived(data.content.translated ? undefined : data.content.contentLang);
	// Icons of the focus cards in order (fixed in code; a 4th card reuses the first icon).
	const focusIcons: IconName[] = ['drop', 'mother', 'foot'];
	// Hero and photo strip are chosen in content/practice.yml (images:).
	const heroImage = $derived(requireImage(practice.images.hero));
	const impressions = $derived(practice.images.impressions.map((name) => requireImage(name)));
</script>

{#if !data.content.translated}
	<div class="container">
		<p class="untranslated"><Icon name="globe" size={18} />{m.not_translated()}</p>
	</div>
{/if}

<section class="hero" aria-labelledby="hero-title">
	<div class="container hero-grid">
		<div class="hero-text" lang={contentLang}>
			<p class="eyebrow">{m.site_tagline()}</p>
			<h1 id="hero-title">{home.heading}</h1>
			<p class="lead">{home.lead}</p>
			<div class="btn-row">
				<ExternalLink href={practice.bookingUrl} class="btn btn-primary">
					<Icon name="calendar" size={18} />{m.book_online_long()}
				</ExternalLink>
				<a class="btn btn-secondary" href="tel:{practice.phones[0].tel}">
					<Icon name="phone" size={18} />{phoneText(practice.phones[0])}
				</a>
			</div>
			{#if practice.certifications.length}
				<div class="certs">
					<ul>
						{#each practice.certifications as cert (cert.image)}
							{@const picture = requireImage(`certifications/${cert.image}`)}
							<li>
								<enhanced:img
									src={picture}
									alt={cert.name[locale]}
									title={cert.name[locale]}
									sizes="72px"
									class="cert-logo"
								/>
							</li>
						{/each}
					</ul>
					<p class="muted">{m.certified_by()}</p>
				</div>
			{/if}
		</div>
		<div class="hero-media">
			<enhanced:img
				src={heroImage}
				alt=""
				sizes="(min-width: 64rem) 28rem, 90vw"
				fetchpriority="high"
				class="hero-img"
			/>
		</div>
	</div>
</section>

{#if data.notice}
	<div class="container notice-wrap">
		<NoticeBanner notice={data.notice} />
	</div>
{/if}

<section class="section focus" aria-labelledby="focus-title">
	<div class="container" lang={contentLang}>
		<h2 id="focus-title">{home.focusHeading}</h2>
		<ul class="focus-grid">
			{#each data.focus as item, i (item.title)}
				<li class="card focus-card">
					<span class="focus-icon"><Icon name={focusIcons[i % focusIcons.length]} size={26} /></span
					>
					<h3>{item.title}</h3>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
					<p>{@html item.html}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section section-tint glance" aria-labelledby="glance-title">
	<div class="container">
		<h2 id="glance-title">{m.glance_title()}</h2>
		<div class="glance-grid">
			<article class="card">
				<h3><Icon name="clock" size={22} />{m.hours_title()}</h3>
				<OpeningHours hours={practice.hours} variant="compact" />
				<a class="link-arrow" href="{localizedPath('kontakt')}#sprechzeiten"
					>{m.more_contact()}<Icon name="arrow" size={18} /></a
				>
			</article>
			<article class="card">
				<h3><Icon name="pin" size={22} />{m.address_title()}</h3>
				<address>
					{practice.name}<br />
					{practice.address.street}<br />
					{cityLine(practice.address, true)}
				</address>
				<a class="link-arrow" href="{localizedPath('kontakt')}#anfahrt"
					>{m.directions_link()}<Icon name="arrow" size={18} /></a
				>
			</article>
			<article class="card">
				<h3><Icon name="phone" size={22} />{m.contact_title()}</h3>
				<ul class="plain">
					{#each practice.phones as phone (phone.tel)}
						<li>
							<a href="tel:{phone.tel}"
								><span class="visually-hidden">{m.phone()}: </span>{phoneText(phone)}</a
							>
						</li>
					{/each}
					{#each practice.emails.filter((e) => e.purpose === 'general') as email (email.address)}
						<li><a href="mailto:{email.address}">{email.address}</a></li>
					{/each}
				</ul>
				<ExternalLink href={practice.bookingUrl} class="link-arrow"
					>{m.book_online_long()}</ExternalLink
				>
			</article>
		</div>
	</div>
</section>

<section class="section teasers">
	<div class="container teaser-grid" lang={contentLang}>
		<article class="teaser">
			<h2>{home.servicesTeaser.heading}</h2>
			<p>{home.servicesTeaser.text}</p>
			<a class="link-arrow" href={localizedPath('leistungen')}
				><span lang={contentLang ? locale : undefined}>{m.more_services()}</span><Icon
					name="arrow"
					size={18}
				/></a
			>
		</article>
		<article class="teaser">
			<h2>{home.teamTeaser.heading}</h2>
			<p>{home.teamTeaser.text}</p>
			<a class="link-arrow" href={localizedPath('team')}
				><span lang={contentLang ? locale : undefined}>{m.more_team()}</span><Icon
					name="arrow"
					size={18}
				/></a
			>
		</article>
	</div>
	{#if impressions.length}
		<div class="container">
			<ul class="impressions" aria-hidden="true">
				{#each impressions as picture, i (i)}
					<li>
						<enhanced:img
							src={picture}
							alt=""
							sizes="(min-width: 64rem) 14rem, 33vw"
							loading="lazy"
						/>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>

<section class="section section-tint welcome">
	<div class="container welcome-inner" lang={contentLang}>
		<figure class="quote">
			<blockquote>
				<p>{home.quote.text}</p>
			</blockquote>
			<figcaption>— {home.quote.author}</figcaption>
		</figure>
		<div class="welcome-text">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
			{@html data.content.html}
			<p class="signoff">{home.signoff}</p>
		</div>
	</div>
</section>

<style>
	.untranslated {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin: var(--space-4) 0 0;
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	/* ── Hero ── */
	.hero {
		padding-block: clamp(2rem, 1.25rem + 3.5vw, 4.5rem) clamp(2rem, 1.5rem + 2vw, 3.5rem);
		background:
			radial-gradient(90% 120% at 100% 0%, var(--color-highlight) 0%, transparent 60%),
			linear-gradient(180deg, var(--color-tint) 0%, var(--color-bg) 100%);
	}

	.hero-grid {
		display: grid;
		gap: var(--space-6);
		align-items: center;
	}

	.hero h1 {
		max-width: 20ch;
	}

	.hero .lead {
		margin-bottom: var(--space-5);
	}

	.hero-media {
		position: relative;
	}

	.hero-media :global(.hero-img) {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.certs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3) var(--space-4);
		margin-top: var(--space-6);
	}

	.certs ul {
		display: flex;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.certs :global(.cert-logo) {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		background: #fff;
	}

	.certs p {
		margin: 0;
		max-width: 18rem;
		font-size: var(--text-sm);
	}

	@media (min-width: 56rem) {
		.hero-grid {
			grid-template-columns: 1.15fr 0.85fr;
			gap: var(--space-7);
		}
		.hero-media :global(.hero-img) {
			aspect-ratio: 1 / 1;
		}
	}

	.notice-wrap {
		margin-top: var(--space-5);
	}

	/* ── Focus ── */
	.focus-grid,
	.plain {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.focus-grid {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-5);
	}

	@media (min-width: 48rem) {
		.focus-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.focus-card h3 {
		font-size: var(--text-lg);
		margin-bottom: var(--space-2);
	}

	.focus-card p {
		margin: 0;
		color: var(--color-muted);
	}

	.focus-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		margin-bottom: var(--space-4);
		border-radius: var(--radius);
		background: var(--color-tint-strong);
		color: var(--color-accent-text);
	}

	/* ── At a glance ── */
	.glance-grid {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-5);
	}

	@media (min-width: 48rem) {
		.glance-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 64rem) {
		.glance-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.glance-grid .card {
		display: flex;
		flex-direction: column;
	}

	.glance-grid h3 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-lg);
	}

	.glance-grid h3 :global(.icon) {
		color: var(--color-decor);
	}

	.glance-grid address {
		font-style: normal;
		margin-bottom: var(--space-4);
	}

	.glance-grid .plain {
		margin-bottom: var(--space-4);
	}

	.glance-grid .plain li {
		padding-block: 0.15rem;
	}

	.glance-grid .plain a {
		display: inline-block;
		padding-block: 0.25rem;
		overflow-wrap: anywhere;
	}

	/* Long address: slightly smaller so it fits on one line in a third of the container */
	.glance-grid .plain a[href^='mailto:'] {
		font-size: var(--text-sm);
	}

	.glance-grid :global(.link-arrow) {
		margin-top: auto;
		padding-top: var(--space-2);
	}

	/* ── Teasers ── */
	.teaser-grid {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 48rem) {
		.teaser-grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-7);
		}
	}

	.teaser {
		padding-left: var(--space-5);
		border-left: 3px solid var(--color-highlight);
	}

	.teaser h2 {
		font-size: var(--text-xl);
		margin-bottom: var(--space-3);
	}

	.teaser p {
		color: var(--color-muted);
		max-width: 52ch;
	}

	.impressions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-3);
		margin: var(--space-7) 0 0;
		padding: 0;
		list-style: none;
	}

	.impressions li:nth-child(n + 4) {
		display: none;
	}

	@media (min-width: 48rem) {
		.impressions {
			grid-template-columns: repeat(5, 1fr);
		}
		.impressions li:nth-child(n + 4) {
			display: block;
		}
	}

	.impressions :global(img) {
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
		border-radius: var(--radius);
		/* Defined edge even for photos with a white background */
		border: 1px solid var(--color-border);
		background: var(--color-tint);
	}

	@media (prefers-color-scheme: dark) {
		.impressions :global(img) {
			filter: brightness(0.85);
		}
	}

	/* ── Welcome / quote ── */
	.welcome-inner {
		display: grid;
		gap: var(--space-6);
		align-items: center;
	}

	@media (min-width: 56rem) {
		.welcome-inner {
			grid-template-columns: 1.2fr 1fr;
			gap: var(--space-8);
		}
	}

	.quote {
		margin: 0;
	}

	.quote blockquote {
		margin: 0;
	}

	.quote p {
		margin: 0 0 var(--space-3);
		font-size: var(--text-2xl);
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--color-heading);
		text-wrap: balance;
	}

	.quote p::before {
		content: open-quote;
		color: var(--color-decor);
	}

	.quote p::after {
		content: close-quote;
		color: var(--color-decor);
	}

	.quote figcaption {
		color: var(--color-muted);
	}

	.welcome-text {
		font-size: var(--text-lg);
	}

	.signoff {
		margin: 0;
		font-weight: 650;
		color: var(--color-accent-text);
	}
</style>
