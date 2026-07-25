<script lang="ts">
	import { Funnel, Plus } from '@lucide/svelte';
	import type { ActionMenuItem, LoadedData, TableProps, Venue, VenueType } from '$lib/types';
	import { loadVenues } from '$lib/api/venue.js';
	import { loadVenueTypes } from '$lib/api/venue-types.js';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddVenue from './add-venue.svelte';
	import VenueFacilitiesSheet from './venue-facilities-sheet.svelte';
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import { nav } from '../header.svelte';
	import DataTableActions from '$lib/components/app/data-table-actions.svelte';
	import { authInfo } from '$lib/global/auth.svelte';
	import TreeTable from '$lib/components/app/tree-table.svelte';

	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading venues...'
	});

	let venueTypesMap = new Map<number, string>();

	let addVenueSheetOpen = $state(false);
	let facilitiesSheetOpen = $state(false);
	let activeVenueId: null | number = $state(null);

	let searchValue = $state('');
	let typeFilterId = $state<number | null>(null);

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

	onMount(async () => {
		nav.set([{ title: 'Venues', url: '/venues' }]);

		try {
			const types = await loadVenueTypes();
			for (const type of types) {
				venueTypesMap.set(type.id, type.name);
			}
		} catch (e) {
			console.error('Failed to load venue types', e);
		}

		await refreshVenues();
	});

	let canModifyFacilities = $derived(permissionGrantedSomewhere('venue:modify_facilities'));

	let actions = $derived.by<ActionMenuItem<Venue>[]>(() => [
		{
			id: 1,
			name: 'View Details',
			onclick: (venue) => {
				goto(`/venues/${venue.id}`);
			}
		},
		...(canModifyFacilities
			? [
					{
						id: 2,
						name: 'Manage Facilities',
						onclick: (venue: Venue) => {
							activeVenueId = venue.id;
							facilitiesSheetOpen = true;
						}
					}
				]
			: [])
	]);

	let canCreateVenue = $derived(permissionGrantedSomewhere('venue:create'));

	let myVenues = $derived.by<{ id: number; name: string; typeName: string }[]>(() => {
		const user = authInfo.get();
		if (!user || user.type === 'admin') return [];
		const venueMemberships = user.memberships.filter((m: any) => m.type === 'venue');
		return venueMemberships.map((m: any) => ({
			id: m.id,
			name: m.name,
			typeName: m.kind.name
		}));
	});

	let filteredVenues = $derived.by(() => {
		if (venues.state !== 'success') return [];
		const myVenueIds = new Set(myVenues.map((v) => v.id));
		return venues.data.filter((venue) => {
			if (myVenueIds.has(venue.id)) return false;
			const matchesSearch = venue.name.toLowerCase().includes(searchValue.toLowerCase());
			const matchesFilter = typeFilterId ? venue.venueTypeId === typeFilterId : true;
			return matchesSearch && matchesFilter;
		});
	});
</script>

<div class="mx-auto w-full max-w-prose pb-16">
	<!-- Toolbar -->
	<div class="sticky top-12 z-40 flex gap-xs bg-background p-3">
		<div class="flex w-full place-items-center gap-2">
			<!-- Filter Dropdown -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon" class="relative size-8 p-0">
							<Funnel />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-48">
					<DropdownMenu.Item onclick={() => (typeFilterId = null)}>
						<div class="flex flex-col gap-0.5">
							<span class="text-sm font-medium">All Venues</span>
						</div>
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					{#each Array.from(venueTypesMap.entries()) as [id, name]}
						<DropdownMenu.Item onclick={() => (typeFilterId = id)}>
							<div class="flex w-full items-center justify-between gap-2">
								<span class="text-sm font-medium">{name}</span>
								{#if typeFilterId === id}
									<div class="size-1.5 h-1.5 w-1.5 rounded-full bg-primary"></div>
								{/if}
							</div>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<SearchInput bind:value={searchValue} placeholder="Search venues..." />

			<!-- Add button -->
			{#if canCreateVenue}
				<Button
					size="icon"
					class="relative size-8 p-0 md:hidden"
					onclick={() => {
						addVenueSheetOpen = true;
					}}
				>
					<Plus />
				</Button>
				<Button
					class="hidden md:inline-flex"
					onclick={() => {
						addVenueSheetOpen = true;
					}}
				>
					<Plus /> Add Venue
				</Button>
			{/if}
		</div>
	</div>

	<!-- List -->
	<div class="px-3">
		{#if venues.state === 'pending'}
			<p class="p-4 text-center">Loading venues...</p>
		{:else if venues.state === 'success'}
			<div class="flex flex-col gap-y-4">
				{#if myVenues.length > 0}
					<div>
						<div class="mb-2 text-xs text-muted-foreground uppercase">My Venues</div>
						<div class="flex flex-col">
							{#each myVenues as venue}
								<a
									href="/venues/{venue.id}"
									class="flex items-center gap-3 border-x border-b p-3 transition-colors first:rounded-t-sm first:border-t last:rounded-b-sm hover:bg-accent"
								>
									<div class="flex flex-col">
										<span class="font-medium">{venue.name}</span>
										<span class="text-xs text-muted-foreground">{venue.typeName}</span>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<TreeTable
					items={filteredVenues}
					treeMode={false}
					columns={[
						{
							header: 'Name',
							render: nameCol
						},
						{
							header: 'Max Capacity',
							render: capacityCol
						},
						{
							header: 'Type',
							render: typeCol
						}
					]}
					onRowClick={(venue: Venue) => {
						goto(`/venues/${venue.id}`);
					}}
					{actions}
					itemLabel="venues"
				>
					{#snippet mobileRow(venue: Venue, _depth: number)}
						<div
							class="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-accent/50"
							onclick={() => goto(`/venues/${venue.id}`)}
							role="button"
							tabindex={0}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') goto(`/venues/${venue.id}`);
							}}
						>
							<div class="flex min-w-0 flex-1 flex-col truncate">
								<span class="mt-0.5 mb-1 truncate text-sm leading-tight font-medium"
									>{venue.name}</span
								>
								<div class="mb-1.5 flex flex-wrap gap-1.5">
									<Badge
										variant="outline"
										class="border-transparent bg-foreground/10 text-[10px] leading-none font-normal text-foreground hover:bg-foreground/15"
										>{venueTypesMap.get(venue.venueTypeId) ?? '—'}</Badge
									>
								</div>
								<span class="truncate text-[10px] leading-tight text-muted-foreground">
									Capacity: {venue.maxCapacity}
								</span>
							</div>
							<div
								class="flex shrink-0 items-center justify-end gap-2"
								onclick={(e) => e.stopPropagation()}
								role="presentation"
							>
								<DataTableActions selectedItem={venue} {actions} />
							</div>
						</div>
					{/snippet}
				</TreeTable>
			</div>
		{:else}
			<p class="p-4 text-center text-red-500">{venues.message}</p>
		{/if}
	</div>
</div>

{#if venues.state === 'success'}
	<AddVenue bind:venues bind:open={addVenueSheetOpen} />
	<VenueFacilitiesSheet
		activeVenueId={activeVenueId!}
		activeVenueName={venues.data.find((v) => v.id === activeVenueId)?.name!}
		bind:sheetOpen={facilitiesSheetOpen}
	/>
{/if}

{#snippet nameCol(venue: Venue, _depth: number)}
	<div class="flex items-center gap-2">
		<span class="font-medium hover:underline">{venue.name}</span>
	</div>
{/snippet}

{#snippet capacityCol(venue: Venue, _depth: number)}
	<span class="text-sm">{venue.maxCapacity}</span>
{/snippet}

{#snippet typeCol(venue: Venue, _depth: number)}
	<Badge variant="outline" class="border-transparent bg-foreground/5 text-muted-foreground">
		{venueTypesMap.get(venue.venueTypeId) ?? '—'}
	</Badge>
{/snippet}
