<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import ExternalLink from '#lib/components/ExternalLink.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import NoticeBanner from '#lib/components/NoticeBanner.svelte';
	import OpeningHours from '#lib/components/OpeningHours.svelte';
	import PageIntro from '#lib/components/PageIntro.svelte';
	import { requireImage } from '#lib/images.js';
	import { cityLine, phoneText } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const page = $derived(data.content);
	const practice = $derived(data.practice);
	const lang = $derived(page.translated ? undefined : page.contentLang);
	const map = requireImage('map/lageplan.png');
	const osmUrl = $derived(
		`https://www.openstreetmap.org/?mlat=${practice.geo.lat}&mlon=${practice.geo.lng}#map=18/${practice.geo.lat}/${practice.geo.lng}`
	);
	const routeUrl = $derived(
		`https://www.openstreetmap.org/directions?to=${practice.geo.lat}%2C${practice.geo.lng}`
	);
</script>

<PageIntro
	title={page.data.title}
	eyebrow={m.nav_contact()}
	translated={page.translated}
	contentLang={page.contentLang}
/>

{#if data.notice}
	<div class="container notice-wrap">
		<NoticeBanner notice={data.notice} />
	</div>
{/if}

<div class="section">
	<div class="container contact-grid">
		<div class="card">
			<section aria-labelledby="address-title">
				<h2 id="address-title"><Icon name="pin" size={22} />{m.address_title()}</h2>
				<address>
					<strong>{practice.doctor}</strong><br />
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
					{#each data.doctorTitles as title, i (i)}<span {lang}>{@html title}</span><br />{/each}
					<span class="addr">
						{practice.address.street}<br />
						{cityLine(practice.address)}
					</span>
				</address>
			</section>

			<section aria-labelledby="contact-title">
				<h2 id="contact-title" class="sub"><Icon name="phone" size={22} />{m.contact_title()}</h2>
				<dl class="contact-dl">
					<div>
						<dt>{m.phone()}</dt>
						<dd>
							{#each practice.phones as phone, i (phone.tel)}
								{#if i > 0}<span class="muted">{m.or()}</span>{/if}
								<a href="tel:{phone.tel}">{phoneText(phone)}</a>
							{/each}
						</dd>
					</div>
					{#if practice.fax}
						<div>
							<dt>{m.fax()}</dt>
							<dd>{phoneText(practice.fax)}</dd>
						</div>
					{/if}
					{#each practice.emails as email (email.address)}
						<div>
							<dt>
								{m.email()}
								<span class="muted"
									>({email.purpose === 'prescriptions'
										? m.email_prescriptions()
										: m.email_general()})</span
								>
							</dt>
							<dd><a href="mailto:{email.address}">{email.address}</a></dd>
						</div>
					{/each}
				</dl>
			</section>
		</div>

		<section class="card" id="sprechzeiten" aria-labelledby="hours-title">
			<h2 id="hours-title"><Icon name="clock" size={22} />{m.hours_title()}</h2>
			<OpeningHours hours={practice.hours} />
			<div class="appointment">
				<h3 {lang}>{page.data.appointmentHeading}</h3>
				<p {lang}>{page.data.appointmentText}</p>
				<div class="btn-row">
					<ExternalLink href={practice.bookingUrl} class="btn btn-primary">
						<Icon name="calendar" size={18} />{m.book_online_long()}
					</ExternalLink>
					<a class="btn btn-secondary" href="tel:{practice.phones[0].tel}">
						<Icon name="phone" size={18} />{phoneText(practice.phones[0])}
					</a>
				</div>
			</div>
		</section>
	</div>
</div>

<section class="section section-tint" id="anfahrt" aria-labelledby="directions-title">
	<div class="container directions">
		<div class="directions-text">
			<h2 id="directions-title" {lang}>{page.data.directionsHeading}</h2>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
			<div class="prose" {lang}>{@html page.html}</div>
			<div class="btn-row">
				<ExternalLink href={routeUrl} class="btn btn-primary">
					<Icon name="route" size={18} />{m.map_route()}
				</ExternalLink>
				<ExternalLink href={osmUrl} class="btn btn-secondary">{m.map_open_osm()}</ExternalLink>
			</div>
		</div>
		<figure class="map">
			<enhanced:img
				src={map}
				alt={page.data.mapAlt}
				{lang}
				sizes="(min-width: 56rem) 40rem, 92vw"
				loading="lazy"
			/>
			<figcaption>
				<ExternalLink href="https://www.openstreetmap.org/copyright"
					>{m.map_attribution()}</ExternalLink
				>
			</figcaption>
		</figure>
	</div>
</section>

<style>
	.notice-wrap {
		margin-top: var(--space-6);
	}

	.contact-grid {
		display: grid;
		gap: var(--space-5);
	}

	@media (min-width: 52rem) {
		.contact-grid {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}

	h2 {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xl);
	}

	h2 :global(.icon) {
		color: var(--color-decor);
	}

	h2.sub {
		margin-top: var(--space-6);
		padding-top: var(--space-5);
		border-top: 1px solid var(--color-border);
	}

	address {
		font-style: normal;
		line-height: 1.7;
	}

	address span {
		color: var(--color-muted);
	}

	.addr {
		display: inline-block;
		margin-top: var(--space-3);
		color: var(--color-text) !important;
	}

	.contact-dl {
		display: grid;
		gap: var(--space-3);
		margin: 0;
	}

	.contact-dl div {
		display: grid;
		gap: 0.1rem;
	}

	.contact-dl dt {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-muted);
	}

	.contact-dl dd {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--space-2);
		margin: 0;
		font-size: var(--text-lg);
	}

	.contact-dl a {
		display: inline-block;
		padding-block: 0.2rem;
		overflow-wrap: anywhere;
	}

	.appointment {
		margin-top: var(--space-5);
		padding-top: var(--space-5);
		border-top: 1px solid var(--color-border);
	}

	.appointment h3 {
		font-size: var(--text-lg);
		margin-bottom: var(--space-2);
	}

	.directions {
		display: grid;
		gap: var(--space-6);
		align-items: center;
	}

	@media (min-width: 56rem) {
		.directions {
			grid-template-columns: 1fr 1.4fr;
			gap: var(--space-7);
		}
	}

	.directions .prose {
		margin-bottom: var(--space-5);
	}

	.map {
		margin: 0;
	}

	.map :global(img) {
		width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	@media (prefers-color-scheme: dark) {
		.map :global(img) {
			filter: brightness(0.85);
		}
	}

	.map figcaption {
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.map figcaption :global(a) {
		color: inherit;
	}
</style>
