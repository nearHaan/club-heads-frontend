<script lang="ts">
	import { goto } from '$app/navigation';
	import { loadFacilities } from '$lib/api/facilities';
	import { loadFacilityTypes } from '$lib/api/facility-types';
	import DataTableActions from '$lib/components/app/data-table-actions.svelte';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import TreeTable from '$lib/components/app/tree-table.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import type { ActionMenuItem, Facility, LoadedData } from '$lib/types';
	import { Funnel, Plus } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { nav } from '../header.svelte';
	import AddFacility from './add-facility.svelte';

	let facilities = $state<LoadedData<Facility[]>>({
		state: 'pending',
		message: 'Loading facilities...'
	});

	let facilityTypesMap = new Map<number, string>();

	let addFacilitySheetOpen = $state(false);

	let searchValue = $state('');
	let typeFilterId = $state<number | null>(null);

	async function refreshFacilities() {
		try {
			facilities = {
				state: 'pending',
				message: 'Refreshing facilities...'
			};
			facilities = {
				state: 'success',
				data: await loadFacilities()
			};
		} catch (error) {
			facilities = {
				state: 'failed',
				message: 'Failed to load facilities'
			};
		}
	}

	onMount(async () => {
		nav.set([{ title: 'Facilities', url: '/facilities' }]);

		try {
			const types = await loadFacilityTypes();
			for (const type of types) {
				facilityTypesMap.set(type.id, type.name);
			}
		} catch (e) {
			console.error('Failed to load facility types', e);
		}

		await refreshFacilities();
	});

	let actions = $derived.by<ActionMenuItem<Facility>[]>(() => [
		{
			id: 1,
			name: 'View details',
			onclick: (facility) => {
				goto(`/facilities/${facility.id}`);
			}
		}
	]);

	let canCreateFacility = $derived(permissionGrantedSomewhere('facility:create'));

	let myFacilities = $derived.by<{ id: number; name: string; typeName: string }[]>(() => {
		const user = authInfo.get();
		if (!user || user.type === 'admin') return [];
		return user.memberships
			.filter((m) => m.type === 'facility')
			.map((m) => ({
				id: m.id,
				name: m.name,
				typeName: m.kind.name
			}));
	});

	let filteredFacilities = $derived.by(() => {
		if (facilities.state !== 'success') return [];
		const myFacilityIds = new Set(myFacilities.map((v) => v.id));
		return facilities.data.filter((facility) => {
			if (myFacilityIds.has(facility.id)) return false;
			const matchesSearch = facility.name.toLowerCase().includes(searchValue.toLowerCase());
			const matchesFilter = typeFilterId ? facility.type.id === typeFilterId : true;
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
							<span class="text-sm font-medium">All facilities</span>
						</div>
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					{#each Array.from(facilityTypesMap.entries()) as [id, name]}
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

			<SearchInput bind:value={searchValue} placeholder="Search facilities..." />

			<!-- Add button -->
			{#if canCreateFacility}
				<Button
					size="icon"
					class="relative size-8 p-0 md:hidden"
					onclick={() => {
						addFacilitySheetOpen = true;
					}}
				>
					<Plus />
				</Button>
				<Button
					class="hidden md:inline-flex"
					onclick={() => {
						addFacilitySheetOpen = true;
					}}
				>
					<Plus /> Add facility
				</Button>
			{/if}
		</div>
	</div>

	<!-- List -->
	<div class="px-3">
		{#if facilities.state === 'pending'}
			<p class="p-4 text-center">Loading facilities...</p>
		{:else if facilities.state === 'success'}
			<div class="flex flex-col gap-y-4">
				{#if myFacilities.length > 0}
					<div>
						<div class="mb-2 text-xs text-muted-foreground uppercase">My Facilities</div>
						<div class="flex flex-col">
							{#each myFacilities as facility}
								<a
									href="/facilities/{facility.id}"
									class="flex items-center gap-3 border-x border-b p-3 transition-colors first:rounded-t-sm first:border-t last:rounded-b-sm hover:bg-accent"
								>
									<div class="flex flex-col">
										<span class="font-medium">{facility.name}</span>
										<span class="text-xs text-muted-foreground">{facility.typeName}</span>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<TreeTable
					items={filteredFacilities}
					treeMode={false}
					columns={[
						{
							header: 'Name',
							render: nameCol
						},
						{
							header: 'Type',
							render: typeCol
						},
						{
							header: 'Association',
							render: associationCol
						},
						{
							header: 'Providers',
							render: providersCol
						}
					]}
					onRowClick={(facility: Facility) => {
						goto(`/facilities/${facility.id}`);
					}}
					{actions}
					itemLabel="facilities"
				>
					{#snippet mobileRow(facility: Facility, _depth: number)}
						<div
							class="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-accent/50"
							onclick={() => goto(`/facilities/${facility.id}`)}
							role="button"
							tabindex={0}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') goto(`/facilities/${facility.id}`);
							}}
						>
							<div class="flex min-w-0 flex-1 flex-col truncate">
								<div class="mb-1 flex items-center gap-1">
									<span class="truncate text-sm leading-tight font-medium"
										>{facility.name}</span
									>
									<Badge
										variant="outline"
										class="border-transparent bg-foreground/10 text-[10px] leading-none font-normal text-foreground hover:bg-foreground/15"
										>{facilityTypesMap.get(facility.type.id) ?? '—'}</Badge
									>
								</div>
								<span class="truncate text-[10px] leading-tight text-muted-foreground">
									Association: {facility.association[0].toUpperCase() +
										facility.association.substring(1)}
								</span>
								{#if facility.providers.length > 0}
									<span class="truncate text-[10px] leading-tight text-muted-foreground">
										Providers: {facility.providers.map((p) => p.scope.name).join(', ')}
									</span>
								{/if}
							</div>
							<div
								class="flex shrink-0 items-center justify-end gap-2"
								onclick={(e) => e.stopPropagation()}
								role="presentation"
							>
								<DataTableActions selectedItem={facility} {actions} />
							</div>
						</div>
					{/snippet}
				</TreeTable>
			</div>
		{:else}
			<p class="p-4 text-center text-red-500">{facilities.message}</p>
		{/if}
	</div>
</div>

{#if facilities.state === 'success'}
	<AddFacility bind:facilities bind:open={addFacilitySheetOpen} />
{/if}

{#snippet nameCol(facility: Facility, _depth: number)}
	<div class="flex items-center gap-2">
		<span class="font-medium hover:underline">{facility.name}</span>
	</div>
{/snippet}

{#snippet typeCol(facility: Facility, _depth: number)}
	<Badge variant="outline" class="border-transparent bg-foreground/5 text-muted-foreground">
		{facilityTypesMap.get(facility.type.id) ?? '—'}
	</Badge>
{/snippet}

{#snippet associationCol(facility: Facility, _depth: number)}
	<span class="text-sm"
		>{facility.association[0].toUpperCase() + facility.association.substring(1)}</span
	>
{/snippet}

{#snippet providersCol(facility: Facility, _depth: number)}
	<span class="text-sm">{facility.providers.map((p) => p.scope.name).join(', ')}</span>
{/snippet}
