<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import PageIntro from '#lib/components/PageIntro.svelte';
	import { requireImage } from '#lib/images.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const page = $derived(data.content);
	const doctor = $derived(page.data.doctor);
	const lang = $derived(page.translated ? undefined : page.contentLang);
	// A photo that is named but missing fails the build; without `photo:` initials are shown.
	const portrait = $derived(doctor.photo ? requireImage(doctor.photo, 'team') : undefined);

	const initials = (name: string) =>
		name
			.split(/\s+/)
			.filter((part) => !part.endsWith('.'))
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
</script>

<PageIntro
	title={page.data.title}
	eyebrow={m.nav_team()}
	translated={page.translated}
	contentLang={page.contentLang}
/>

<div {lang}>
	<section class="section doctor" aria-labelledby="doctor-name">
		<div class="container doctor-grid">
			<div class="doctor-card">
				{#if portrait}
					<enhanced:img
						src={portrait}
						alt={m.photo_of({ name: doctor.name })}
						sizes="(min-width: 36rem) 13rem, 90vw"
						fetchpriority="high"
						class="portrait"
					/>
				{/if}
				<div class="doctor-meta">
					<p class="eyebrow">{page.data.doctorHeading}</p>
					<h2 id="doctor-name">{doctor.name}</h2>
					<ul class="titles">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
						{#each data.doctorHtml.titles as title, i (i)}<li>{@html title}</li>{/each}
					</ul>
				</div>
			</div>

			<div class="doctor-details">
				{#if page.html}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
					<div class="prose">{@html page.html}</div>
				{/if}
				<h3>{m.team_cv()}</h3>
				<ol class="timeline">
					{#each data.doctorHtml.cv as entry, i (i)}
						<li>
							<span class="period">{entry.period}</span>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
							<span class="what">{@html entry.html}</span>
						</li>
					{/each}
				</ol>

				<div class="facts">
					<section class="card" aria-labelledby="languages-title">
						<h3 id="languages-title">{m.team_languages()}</h3>
						<ul>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
							{#each data.doctorHtml.languages as language, i (i)}<li>{@html language}</li>{/each}
						</ul>
					</section>
					<section class="card" aria-labelledby="memberships-title">
						<h3 id="memberships-title">{m.team_memberships()}</h3>
						<ul>
							{#each data.doctorHtml.memberships as membership, i (i)}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
								<li>{@html membership}</li>
							{/each}
						</ul>
					</section>
				</div>
			</div>
		</div>
	</section>

	<section class="section section-tint staff" aria-labelledby="staff-title">
		<div class="container">
			<h2 id="staff-title">{page.data.staffHeading}</h2>
			<ul class="staff-grid">
				{#each page.data.staff as person, p (person.name)}
					{@const photo = person.photo ? requireImage(person.photo, 'team') : undefined}
					<li class="card person">
						{#if photo}
							<enhanced:img
								src={photo}
								alt={m.photo_of({ name: person.name })}
								sizes="(min-width: 64rem) 16rem, (min-width: 40rem) 45vw, 90vw"
								loading="lazy"
								class="person-photo"
							/>
						{:else}
							<div class="person-photo placeholder" aria-hidden="true">
								<span>{initials(person.name)}</span>
							</div>
						{/if}
						<h3>{person.name}</h3>
						<ul class="roles">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted Markdown from /content -->
							{#each data.staffRoles[p] as role, i (i)}<li>{@html role}</li>{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</div>
	</section>
</div>

<style>
	.doctor-grid {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 56rem) {
		.doctor-grid {
			grid-template-columns: 18rem 1fr;
			gap: var(--space-8);
			align-items: start;
		}
		.doctor-card {
			position: sticky;
			top: calc(var(--header-h) + var(--space-5));
		}
	}

	.doctor-card {
		display: grid;
		gap: var(--space-4);
	}

	@media (min-width: 36rem) and (max-width: 55.99rem) {
		.doctor-card {
			grid-template-columns: 14rem 1fr;
			align-items: end;
		}
	}

	/*
	 * The only portrait available is small (264 × 203 px): keep it at most ~13rem wide so it is
	 * not blown up. Replace src/lib/assets/images/team/regina-nadolny.jpg with a larger photo
	 * (≥ 600 × 800 px) to remove this cap.
	 */
	.doctor-card :global(.portrait) {
		width: 100%;
		max-width: 13rem;
		aspect-ratio: 4 / 4.2;
		object-fit: cover;
		object-position: 40% 20%;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.doctor-meta h2 {
		margin-bottom: var(--space-2);
	}

	.titles,
	.roles,
	.facts ul,
	.staff-grid {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.titles li {
		color: var(--color-muted);
		font-weight: 500;
	}

	.doctor-details h3 {
		font-size: var(--text-xl);
	}

	.timeline {
		position: relative;
		margin: 0 0 var(--space-7);
		padding: 0;
		list-style: none;
	}

	.timeline li {
		position: relative;
		display: grid;
		gap: var(--space-1);
		padding: 0 0 var(--space-5) var(--space-6);
	}

	.timeline li::before {
		content: '';
		position: absolute;
		left: 0.3rem;
		top: 0.45rem;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: var(--color-bg);
		border: 2px solid var(--color-accent);
	}

	.timeline li::after {
		content: '';
		position: absolute;
		left: calc(0.3rem + 0.375rem - 1px);
		top: 1.35rem;
		bottom: 0.1rem;
		width: 2px;
		background: var(--color-border-strong);
	}

	.timeline li:last-child {
		padding-bottom: 0;
	}

	.timeline li:last-child::after {
		display: none;
	}

	.timeline li:last-child::before {
		background: var(--color-accent);
	}

	.period {
		font-weight: 650;
		color: var(--color-accent-text);
		font-variant-numeric: tabular-nums;
	}

	@media (min-width: 40rem) {
		.timeline li {
			grid-template-columns: 8.5rem 1fr;
			gap: var(--space-4);
		}
	}

	.facts {
		display: grid;
		gap: var(--space-4);
	}

	@media (min-width: 40rem) {
		.facts {
			grid-template-columns: 1fr 2fr;
		}
	}

	.facts h3 {
		font-size: var(--text-lg);
		margin-bottom: var(--space-3);
	}

	.facts li {
		padding-block: var(--space-1);
	}

	.facts li + li {
		border-top: 1px solid var(--color-border);
	}

	.staff-grid {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-5);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
	}

	.person {
		padding: var(--space-3) var(--space-3) var(--space-5);
	}

	.person :global(.person-photo) {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		object-position: 50% 15%;
		border-radius: var(--radius);
		margin-bottom: var(--space-4);
		background: var(--color-tint-strong);
	}

	.placeholder {
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 30% 20%, var(--color-highlight), transparent 70%),
			var(--color-tint-strong);
	}

	.placeholder span {
		font-size: 3rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		color: var(--color-accent-text);
	}

	.person h3,
	.person .roles {
		padding-inline: var(--space-2);
	}

	.person h3 {
		font-size: var(--text-lg);
		margin-bottom: var(--space-2);
	}

	.roles li {
		color: var(--color-muted);
		font-size: var(--text-sm);
		line-height: 1.45;
		padding-block: 0.1rem;
	}
</style>
