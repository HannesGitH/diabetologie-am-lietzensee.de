<script lang="ts">
	import ProsePage from '#lib/components/ProsePage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ProsePage page={data.content} />
