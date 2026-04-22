<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { PlusIcon } from '@lucide/svelte';
	import { columns } from './column';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import type { LoadedData, Venue } from '$lib/types';
	import { loadVenues } from '$lib/api/venue.js';
	import { onMount } from 'svelte';
	import AssignRole from './assign-role.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddVenue from './add-venue.svelte';

	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading venues...'
	});

	let sheetOpen = $state(false);
	let errorText = $state('');

	async function refreshVenues() {
		try {
			venues = {
				state: 'pending',
				message: 'Refreshing venues...'
			};
			venues = {
				state: 'success',
				data: await loadVenues()
			};
		} catch (error) {
			venues = {
				state: 'failed',
				message: 'Failed to load venues'
			};
		}
	}

	onMount(refreshVenues);
</script>

<div class="flex w-full flex-col">
	<div class="border-muted-background flex w-full justify-between items-center border-b p-xxs">
		<h1 class="text-xl font-bold px-2">Venues</h1>
		<Button
			onclick={() => {
				sheetOpen = true;
			}}>Add Venue <PlusIcon /></Button
		>
	</div>
	<div class="p-xxs">
		{#if venues.state === 'pending'}
			<p class="p-4 text-center">Loading venues...</p>
		{:else if venues.state === 'success'}
			<DataTable data={venues.data} {columns} />
		{:else}
			<p class="p-4 text-center text-red-500">{venues.message}</p>
		{/if}
	</div>
</div>

<AddVenue bind:open={sheetOpen} />
<AssignRole />
