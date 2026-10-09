<script lang="ts" module>
	import { m } from '#lib/paraglide/messages.js';
	import type { Weekday, TimeRange } from '#lib/types.js';

	const DAY_NAMES: Record<Weekday, () => string> = {
		mon: m.day_mon,
		tue: m.day_tue,
		wed: m.day_wed,
		thu: m.day_thu,
		fri: m.day_fri,
		sat: m.day_sat,
		sun: m.day_sun
	};

	const DAY_SHORT: Record<Weekday, () => string> = {
		mon: m.day_short_mon,
		tue: m.day_short_tue,
		wed: m.day_short_wed,
		thu: m.day_short_thu,
		fri: m.day_short_fri,
		sat: m.day_short_sat,
		sun: m.day_short_sun
	};

	const SEPARATOR = ' · ';
	const trim = (time: string) => time.replace(/^0(\d)/, '$1');
	const formatRange = (range: TimeRange) =>
		m.time_range({ from: trim(range.from), to: trim(range.to) });
</script>

<script lang="ts">
	import type { DayHours } from '#lib/types.js';

	let { hours, variant = 'table' }: { hours: DayHours[]; variant?: 'table' | 'compact' } = $props();
</script>

{#if variant === 'table'}
	<table class="hours-table">
		<caption class="visually-hidden">{m.hours_caption()}</caption>
		<thead class="visually-hidden">
			<tr>
				<th scope="col">{m.hours_day()}</th>
				<th scope="col">{m.hours_time()}</th>
			</tr>
		</thead>
		<tbody>
			{#each hours as day (day.day)}
				<tr>
					<th scope="row">{DAY_NAMES[day.day]()}</th>
					<td>
						{#each day.times as range, i (i)}
							<span class="range">{i > 0 ? ' ' : ''}{formatRange(range)}</span>
						{/each}
						{#if day.note === 'by_appointment'}
							<span class="note">… {m.hours_by_appointment()}</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<dl class="hours-compact">
		{#each hours as day (day.day)}
			<div>
				<dt>
					<span aria-hidden="true">{DAY_SHORT[day.day]()}</span><span class="visually-hidden"
						>{DAY_NAMES[day.day]()}</span
					>
				</dt>
				<dd>
					{#each day.times as range, i (i)}
						{#if i > 0}<span class="sep">{SEPARATOR}</span>{/if}<span class="range"
							>{formatRange(range)}</span
						>
					{/each}
					{#if day.note === 'by_appointment'}
						<span class="note">… {m.hours_by_appointment()}</span>
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
{/if}

<style>
	.hours-table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	.hours-table th,
	.hours-table td {
		padding: var(--space-3) 0;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--color-border);
	}

	.hours-table tr:last-child th,
	.hours-table tr:last-child td {
		border-bottom: 0;
	}

	.hours-table th {
		width: 38%;
		padding-right: var(--space-4);
		font-weight: 600;
		color: var(--color-heading);
	}

	.range {
		display: block;
	}

	.note {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.hours-compact {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.hours-compact div {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		gap: var(--space-3);
	}

	.hours-compact dt {
		font-weight: 650;
		color: var(--color-heading);
	}

	.hours-compact dd {
		margin: 0;
	}

	/* Break lines only between ranges, never inside "14:30–16:30 Uhr". */
	.hours-compact .range {
		display: inline;
		white-space: nowrap;
	}

	.sep {
		color: var(--color-muted);
	}
</style>
