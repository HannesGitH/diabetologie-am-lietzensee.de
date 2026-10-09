<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { deLocalizeHref } from '#lib/paraglide/runtime.js';
	import { NAV_ITEMS, cityLine, localizedPath, pagePath, phoneText } from '#lib/site.js';
	import type { Practice } from '#lib/types.js';
	import ExternalLink from './ExternalLink.svelte';
	import Icon from './Icon.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import Logo from './Logo.svelte';

	let { practice }: { practice: Practice } = $props();

	const current = $derived(deLocalizeHref(page.url.pathname));
	const isCurrent = (slug: (typeof NAV_ITEMS)[number]['slug']) => current === pagePath(slug);
	const phone = $derived(practice.phones[0]);
</script>

<!--
	One banner landmark for the whole header. The utility bar (desktop only) scrolls away;
	the row below sticks, because the header sticks with a negative offset of the bar's height.
-->
<header class="site-header">
	<div class="topbar">
		<div class="container topbar-inner">
			<p class="topbar-info">
				<span
					><Icon name="pin" size={16} />{practice.address.street}, {cityLine(
						practice.address
					)}</span
				>
				<a href="tel:{phone.tel}"
					><Icon name="phone" size={16} /><span class="visually-hidden">{m.phone()}:</span>
					{phoneText(phone)}</a
				>
			</p>
			<LanguageSwitcher />
		</div>
	</div>

	<div class="container header-inner">
		<a class="brand" href={localizedPath('home')}>
			<Logo size={40} />
			<span class="brand-text">
				<span class="brand-name">{practice.name}</span>
				<span class="brand-tag">{m.site_tagline()}</span>
			</span>
		</a>

		<nav class="nav-desktop" aria-label={m.nav_label()}>
			<ul>
				{#each NAV_ITEMS as item (item.slug)}
					<li>
						<a
							href={localizedPath(item.slug)}
							aria-current={isCurrent(item.slug) ? 'page' : undefined}>{item.label()}</a
						>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="header-cta">
			<ExternalLink href={practice.bookingUrl} class="btn btn-primary">
				<Icon name="calendar" size={18} />{m.book_online()}
			</ExternalLink>
		</div>

		<a class="icon-btn phone-mobile" href="tel:{phone.tel}">
			<Icon name="phone" size={22} />
			<span class="visually-hidden">{m.call()}: {phoneText(phone)}</span>
		</a>

		<!--
			No-JS menu. While it is open, main content and footer are hidden (see app.css), so
			keyboard focus can never move to content hidden behind the panel.
		-->
		<details class="nav-mobile">
			<summary>
				<span class="icon-open"><Icon name="menu" size={22} /></span>
				<span class="icon-close"><Icon name="close" size={22} /></span>
				<span class="summary-label">{m.menu()}</span>
			</summary>
			<div class="panel">
				<nav aria-label={m.nav_label()}>
					<ul>
						{#each NAV_ITEMS as item (item.slug)}
							<li>
								<a
									href={localizedPath(item.slug)}
									aria-current={isCurrent(item.slug) ? 'page' : undefined}>{item.label()}</a
								>
							</li>
						{/each}
					</ul>
				</nav>
				<div class="panel-actions">
					<ExternalLink href={practice.bookingUrl} class="btn btn-primary">
						<Icon name="calendar" size={18} />{m.book_online_long()}
					</ExternalLink>
					<a class="btn btn-secondary" href="tel:{phone.tel}">
						<Icon name="phone" size={18} />{m.call()}: {phoneText(phone)}
					</a>
				</div>
				<LanguageSwitcher variant="stacked" />
			</div>
		</details>
	</div>
</header>

<style>
	/* ── Top utility bar (desktop only) ── */
	.topbar {
		display: none;
		background: var(--color-tint);
		border-bottom: 1px solid var(--color-border);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.topbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		/* 2.5rem including the 1px border of .topbar (= --topbar-h) */
		min-height: calc(var(--topbar-h) - 1px);
	}

	.topbar-info {
		display: flex;
		gap: var(--space-5);
		margin: 0;
	}

	.topbar-info span,
	.topbar-info a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.topbar-info a {
		color: inherit;
		text-decoration: none;
	}

	.topbar-info a:hover {
		color: var(--color-accent-text);
		text-decoration: underline;
	}

	.topbar-info :global(.icon) {
		color: var(--color-decor);
	}

	/* ── Main header ── */
	.site-header {
		--topbar-h: 0px;
		position: sticky;
		/* Let the utility bar scroll away; the main row stays at the top. */
		top: calc(-1 * var(--topbar-h));
		z-index: 20;
		background: color-mix(in srgb, var(--color-bg) 94%, transparent);
		backdrop-filter: saturate(1.4) blur(10px);
		-webkit-backdrop-filter: saturate(1.4) blur(10px);
		border-bottom: 1px solid var(--color-border);
	}

	.header-inner {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--header-h);
	}

	.brand {
		display: flex;
		flex: 1 1 auto;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
		margin-right: auto;
		min-height: 2.75rem;
		color: var(--color-heading);
		text-decoration: none;
	}

	.brand:hover {
		color: var(--color-heading);
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.brand-name {
		font-weight: 650;
		font-size: clamp(1rem, 0.94rem + 0.3vw, 1.1875rem);
		letter-spacing: -0.01em;
	}

	.brand-tag {
		font-size: 0.8125rem;
		color: var(--color-muted);
	}

	/* Desktop nav */
	.nav-desktop,
	.header-cta {
		display: none;
	}

	.header-cta :global(.btn) {
		white-space: nowrap;
	}

	.nav-desktop ul {
		display: flex;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.nav-desktop a {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding-inline: var(--space-3);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-weight: 500;
		text-decoration: none;
	}

	.nav-desktop a:hover {
		background: var(--color-tint);
		color: var(--color-heading);
	}

	.nav-desktop a[aria-current='page'] {
		color: var(--color-accent-text);
		font-weight: 650;
	}

	.nav-desktop a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: var(--space-3);
		right: var(--space-3);
		bottom: 0.3rem;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
	}

	/* Mobile: phone + menu */
	.icon-btn,
	.nav-mobile summary {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-width: 2.75rem;
		min-height: 2.75rem;
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius);
		background: var(--color-surface);
		color: var(--color-accent-text);
	}

	.nav-mobile summary {
		padding-inline: var(--space-3);
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}

	.nav-mobile summary::-webkit-details-marker {
		display: none;
	}

	.icon-close,
	.nav-mobile[open] .icon-open {
		display: none;
	}

	.nav-mobile[open] .icon-close {
		display: inline-flex;
	}

	.icon-open {
		display: inline-flex;
	}

	.nav-mobile[open] summary {
		background: var(--color-tint-strong);
	}

	.panel {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		/* 100% = height of the header (the containing block), whatever it is */
		max-height: calc(100dvh - 100%);
		overflow-y: auto;
		padding: var(--space-4) var(--gutter) var(--space-6);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}

	.panel ul {
		margin: 0 0 var(--space-5);
		padding: 0;
		list-style: none;
	}

	.panel li + li {
		border-top: 1px solid var(--color-border);
	}

	.panel nav a {
		display: flex;
		align-items: center;
		min-height: 3.25rem;
		padding-inline: var(--space-2);
		color: var(--color-heading);
		font-size: var(--text-lg);
		font-weight: 500;
		text-decoration: none;
	}

	.panel nav a[aria-current='page'] {
		color: var(--color-accent-text);
		font-weight: 650;
		box-shadow: inset 3px 0 0 var(--color-accent);
		padding-left: var(--space-4);
	}

	.panel-actions {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}

	/* Narrow phones (and 400 % zoom): drop the tagline, keep the menu label for screen readers only. */
	@media (max-width: 26rem) {
		.brand-tag {
			display: none;
		}
		.summary-label {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
			border: 0;
		}
	}

	@media (min-width: 64rem) {
		.site-header {
			--topbar-h: 2.5rem;
		}
		.topbar {
			display: block;
		}
		.nav-desktop,
		.header-cta {
			display: block;
		}
		.nav-mobile,
		.phone-mobile {
			display: none;
		}
	}

	/* Narrow desktop (e.g. 1024 px, long Russian labels): make the row fit on one line. */
	@media (min-width: 64rem) and (max-width: 74.99rem) {
		.brand-tag {
			display: none;
		}
		.nav-desktop a {
			padding-inline: var(--space-2);
		}
		.nav-desktop a[aria-current='page']::after {
			left: var(--space-2);
			right: var(--space-2);
		}
	}
</style>
