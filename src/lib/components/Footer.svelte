<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { LEGAL_ITEMS, NAV_ITEMS, cityLine, localizedPath, phoneText } from '#lib/site.js';
	import type { Practice } from '#lib/types.js';
	import ExternalLink from './ExternalLink.svelte';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';
	import OpeningHours from './OpeningHours.svelte';

	let { practice, year }: { practice: Practice; year: number } = $props();
</script>

<footer class="site-footer">
	<div class="container footer-grid">
		<div class="footer-brand">
			<p class="brand">
				<Logo size={36} />
				<span>
					<span class="brand-name">{practice.name}</span>
					<span class="brand-tag">{m.site_tagline()}</span>
				</span>
			</p>
			<address>
				{practice.doctor}<br />
				{practice.address.street}<br />
				{cityLine(practice.address)}
			</address>
			<ExternalLink href={practice.bookingUrl} class="btn btn-primary">
				<Icon name="calendar" size={18} />{m.book_online_long()}
			</ExternalLink>
		</div>

		<!-- Plain divs: the footer is already a landmark; nested regions would duplicate page names. -->
		<div>
			<h2>{m.contact_title()}</h2>
			<ul class="contact-list">
				{#each practice.phones as phone (phone.tel)}
					<li>
						<Icon name="phone" size={18} />
						<a href="tel:{phone.tel}"
							><span class="visually-hidden">{m.phone()}: </span>{phoneText(phone)}</a
						>
					</li>
				{/each}
				{#if practice.fax}
					<li>
						<Icon name="fax" size={18} /><span>{m.fax()}: {phoneText(practice.fax)}</span>
					</li>
				{/if}
				{#each practice.emails as email (email.address)}
					<li>
						<Icon name="mail" size={18} />
						<a href="mailto:{email.address}">{email.address}</a>
					</li>
				{/each}
			</ul>
		</div>

		<div>
			<h2>{m.hours_title()}</h2>
			<OpeningHours hours={practice.hours} variant="compact" />
		</div>

		<nav aria-labelledby="footer-pages">
			<h2 id="footer-pages">{m.footer_pages()}</h2>
			<ul class="link-list">
				{#each [...NAV_ITEMS, ...LEGAL_ITEMS] as item (item.slug)}
					<li><a href={localizedPath(item.slug)}>{item.label()}</a></li>
				{/each}
			</ul>
		</nav>
	</div>

	<div class="footer-bottom">
		<div class="container bottom-inner">
			<p>
				© {year} – {practice.copyright}{#if practice.photoCredit}{` & ${practice.photoCredit}`}{/if}
			</p>
			<ul class="legal">
				{#each LEGAL_ITEMS as item (item.slug)}
					<li><a href={localizedPath(item.slug)}>{item.label()}</a></li>
				{/each}
			</ul>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		margin-top: auto;
		background: var(--color-tint);
		border-top: 1px solid var(--color-border);
		font-size: var(--text-sm);
	}

	.footer-grid {
		display: grid;
		gap: var(--space-6) var(--space-5);
		padding-block: var(--space-7);
		grid-template-columns: 1fr;
	}

	@media (min-width: 40rem) {
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 64rem) {
		.footer-grid {
			grid-template-columns: 1.2fr 1.3fr 1.3fr 0.7fr;
		}
	}

	h2 {
		margin: 0 0 var(--space-3);
		font-size: 0.8125rem;
		font-weight: 650;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.brand > span {
		display: flex;
		flex-direction: column;
		line-height: 1.25;
	}

	.brand-name {
		font-weight: 650;
		font-size: var(--text-base);
		color: var(--color-heading);
	}

	.brand-tag {
		color: var(--color-muted);
	}

	address {
		font-style: normal;
		margin-bottom: var(--space-4);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.contact-list li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 2.25rem;
	}

	.contact-list :global(.icon) {
		color: var(--color-decor);
	}

	.contact-list a {
		overflow-wrap: anywhere;
	}

	.link-list a {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		color: var(--color-text);
		text-decoration: none;
	}

	.link-list a:hover {
		color: var(--color-accent-text);
		text-decoration: underline;
	}

	.footer-bottom {
		border-top: 1px solid var(--color-border);
		color: var(--color-muted);
	}

	.bottom-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2) var(--space-5);
		padding-block: var(--space-4);
	}

	.bottom-inner p {
		margin: 0;
	}

	.legal {
		display: flex;
		gap: var(--space-4);
	}

	.legal a {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		color: inherit;
	}
</style>
