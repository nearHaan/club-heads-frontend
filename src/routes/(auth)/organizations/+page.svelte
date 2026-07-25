<script lang="ts">
	import { Funnel, Plus, Pencil, ListTree, List } from '@lucide/svelte';
	import type { LoadedData, Organization, OrganizationType, ActionMenuItem } from '$lib/types';
	import { onMount } from 'svelte';
	import { loadOrgs, loadOrgTypes } from '$lib/api/organizations';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddOrganization from './add-organization.svelte';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import { nav } from '../header.svelte';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import TreeTable from '$lib/components/app/tree-table.svelte';
	import DataTableActions from '$lib/components/app/data-table-actions.svelte';
	import { authInfo } from '$lib/global/auth.svelte';
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';

	let orgTypes = $state<LoadedData<OrganizationType[]>>({
		state: 'pending',
		message: 'Loading organizations types...'
	});

	let fetchedOrgs = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations'
	});

	let searchValue = $state('');
	let typeFilters = $state<Record<number, boolean>>({});
	let treeMode = $state(true);

	$effect(() => {
		if (orgTypes.state === 'success') {
			const current = untrack(() => typeFilters);
			const updated: Record<number, boolean> = {};
			for (const t of orgTypes.data) {
				updated[t.id] = current[t.id] ?? true;
			}
			typeFilters = updated;
		}
	});

	let orgTypeMap = $derived.by<Map<number, string>>(() => {
		if (orgTypes.state !== 'success') return new Map();
		return new Map(orgTypes.data.map((t) => [t.id, t.name]));
	});

	let orgNameMap = $derived.by<Map<number, string>>(() => {
		if (fetchedOrgs.state !== 'success') return new Map();
		return new Map(fetchedOrgs.data.map((o) => [o.id, o.name]));
	});

	let myOrganizations = $derived.by<{ id: number; name: string; typeName: string }[]>(() => {
		const user = authInfo.get();
		if (!user || user.type === 'admin') return [];
		const orgMemberships = user.memberships.filter((m) => m.type === 'organization');
		return orgMemberships.map((m) => ({
			id: m.id,
			name: m.name,
			typeName: m.kind.name
		}));
	});

	let treeOrgs = $derived.by<Organization[]>(() => {
		if (fetchedOrgs.state !== 'success') return [];
		if (myOrganizations.length === 0) return fetchedOrgs.data;
		const myOrgIds = new Set(myOrganizations.map((o) => o.id));
		return fetchedOrgs.data.filter((o) => !myOrgIds.has(o.id));
	});

	let matchCounts = $derived.by<Record<number, number>>(() => {
		if (fetchedOrgs.state !== 'success') return {};
		const search = searchValue.toLowerCase().trim();
		const counts: Record<number, number> = {};
		const myOrgIds = new Set(myOrganizations.map((o) => o.id));
		for (const o of fetchedOrgs.data) {
			if (myOrgIds.has(o.id)) continue;
			if (!search || o.name.toLowerCase().includes(search)) {
				counts[o.organizationTypeId] = (counts[o.organizationTypeId] || 0) + 1;
			}
		}
		return counts;
	});

	let visibleItemIds = $derived.by<Set<number> | null>(() => {
		if (fetchedOrgs.state !== 'success') return null;

		const search = searchValue.toLowerCase().trim();
		const hasActiveFilter = Object.values(typeFilters).some((v) => !v);

		if (!search && !hasActiveFilter) return null;

		const matches = new Set<number>();
		const parentMap = new Map<number, number | null>();
		const myOrgIds = new Set(myOrganizations.map((o) => o.id));

		for (const o of fetchedOrgs.data) {
			parentMap.set(o.id, o.parentOrganizationId);
			if (myOrgIds.has(o.id)) continue;

			let match = true;
			if (search) match = o.name.toLowerCase().includes(search);
			if (match && hasActiveFilter) {
				match = typeFilters[o.organizationTypeId] !== false;
			}
			if (match) matches.add(o.id);
		}

		const includeSet = new Set<number>();
		for (const id of matches) {
			let curr: number | null = id;
			while (curr !== null && curr !== undefined) {
				if (includeSet.has(curr)) break;
				includeSet.add(curr);
				curr = parentMap.get(curr) ?? null;
			}
		}

		return includeSet;
	});

	let actions = $derived.by<ActionMenuItem<Organization>[]>(() => {
		return [
			{
				id: 1,
				name: 'View Details',
				onclick: (org: Organization) => {
					goto(`/organizations/${org.id}`);
				}
			}
		];
	});

	onMount(async () => {
		nav.set([{ title: 'Organizations', url: '/organizations' }]);

		try {
			fetchedOrgs = {
				state: 'success',
				data: await loadOrgs()
			};
		} catch (error) {
			fetchedOrgs = {
				state: 'failed',
				message: 'Failed to load organizations'
			};
		}
		try {
			orgTypes = {
				state: 'success',
				data: await loadOrgTypes()
			};
		} catch (error) {
			orgTypes = {
				state: 'failed',
				message: 'Failed to load organization types'
			};
		}
	});

	let addSheetOpen = $state(false);
	let canCreateOrg = $derived(permissionGrantedSomewhere('organization:create'));
</script>

<div class="mx-auto w-full max-w-prose">
	<div class="sticky top-12 z-40 flex gap-xs bg-background p-3">
		<div class="flex w-full place-items-center gap-2">
			{#if orgTypes.state === 'success'}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon" class="relative size-8 p-0">
								<Funnel />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start">
						<div class="p-3">
							<div>
								<div class="mb-2 font-medium">Organization Type</div>
								<div>
									{#each orgTypes.data as orgType}
										<div class="flex place-items-center gap-2 text-sm">
											<Checkbox bind:checked={typeFilters[orgType.id]} id="orgtype-{orgType.id}" />
											<label for="orgtype-{orgType.id}">{orgType.name}</label>
											{#if fetchedOrgs.state === 'success'}
												<span
													class="text-xs text-muted-foreground"
													transition:slide={{ axis: 'x' }}
												>
													{matchCounts[orgType.id] ?? 0}
												</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}

			<Button
				variant="outline"
				size="icon"
				class="relative hidden size-8 p-0 md:inline-flex"
				onclick={() => {
					treeMode = !treeMode;
				}}
			>
				{#if treeMode}
					<List />
				{:else}
					<ListTree />
				{/if}
			</Button>

			<SearchInput bind:value={searchValue} placeholder="Search organizations..." />

			{#if canCreateOrg}
				<Button
					size="icon"
					class="relative size-8 p-0 md:hidden"
					onclick={() => {
						addSheetOpen = true;
					}}
				>
					<Plus />
				</Button>
				<Button
					class="hidden md:inline-flex"
					onclick={() => {
						addSheetOpen = true;
					}}
				>
					<Plus /> Add Organization
				</Button>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-y-4 p-r-pad">
		{#if fetchedOrgs.state === 'pending'}
			<div class="grid animate-pulse gap-2">
				{#each Array.from({ length: 5 }) as _}
					<div class="h-10 animate-pulse rounded-sm border bg-neutral-200/80"></div>
				{/each}
			</div>
		{:else if fetchedOrgs.state === 'success'}
			{#if myOrganizations.length > 0}
				<div>
					<div class="mb-2 text-xs text-muted-foreground uppercase">My Organizations</div>
					<div class="flex flex-col gap-2">
						{#each myOrganizations as org}
							<a
								href="/organizations/{org.id}"
								class="flex items-center gap-3 rounded-sm border p-3 transition-colors hover:bg-accent"
							>
								<ShapeAvatarSvg seed={org.name} size={32} class="rounded-xs" />
								<div class="flex flex-col">
									<span class="font-medium">{org.name}</span>
									<span class="text-xs text-muted-foreground">{org.typeName}</span>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<TreeTable
				items={treeOrgs}
				{treeMode}
				{visibleItemIds}
				columns={[
					{
						header: 'Name',
						render: nameCol
					},
					{
						header: 'Types',
						render: typeCol
					},
					{
						header: 'Parent',
						render: parentCol
					}
				]}
				getParentId={(org) => org.parentOrganizationId}
				onRowClick={(org) => {
					goto(`/organizations/${org.id}`);
				}}
				{actions}
				actionPrefix={pencilSlot}
				itemLabel="organizations"
			>
				{#snippet mobileRow(org: Organization, _depth: number)}
					<div
						class="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-accent/50"
						onclick={() => goto(`/organizations/${org.id}`)}
						role="button"
						tabindex={0}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') goto(`/organizations/${org.id}`);
						}}
					>
						<ShapeAvatarSvg seed={org.name} size={40} class="rounded-xs" />
						<div class="flex min-w-0 flex-1 flex-col truncate">
							{#if org.parentOrganizationId && orgNameMap.has(org.parentOrganizationId)}
								<span class="truncate text-[10px] text-muted-foreground leading-tight"
									>{orgNameMap.get(org.parentOrganizationId)}</span
								>
							{/if}
							<span class="truncate text-sm font-medium leading-tight mt-1 mb-0.5">{org.name}</span>
							<div class="mt-1">
								<Badge variant="outline" class="bg-foreground/10 text-foreground border-transparent text-[10px] font-normal leading-none"
									>{orgTypeMap.get(org.organizationTypeId) ?? '—'}</Badge
								>
							</div>
						</div>
						<div class="flex shrink-0 items-center gap-2 justify-end" onclick={(e) => e.stopPropagation()} role="presentation">
							{#if canCreateOrg}
								<button
									class="text-muted-foreground hover:text-foreground"
								>
									<Pencil size={14} />
								</button>
							{/if}
							<DataTableActions selectedItem={org} {actions} />
						</div>
					</div>
				{/snippet}
			</TreeTable>
		{:else}
			<p>Failed to load organizations</p>
		{/if}
	</div>
</div>

{#snippet nameCol(org: Organization, _depth: number)}
	<div class="flex items-center gap-2">
		<ShapeAvatarSvg seed={org.name} size={24} class="rounded-xs" />
		<span class="font-medium hover:underline">{org.name}</span>
	</div>
{/snippet}

{#snippet pencilSlot(org: Organization)}
	{#if canCreateOrg}
		<button
			class="text-muted-foreground hover:text-foreground"
			onclick={(e) => {
				e.stopPropagation();
			}}
		>
			<Pencil size={14} />
		</button>
	{/if}
{/snippet}

{#snippet typeCol(org: Organization, _depth: number)}
	<Badge variant="outline" class="bg-foreground/5">
		{orgTypeMap.get(org.organizationTypeId) ?? '—'}
	</Badge>
{/snippet}

{#snippet parentCol(org: Organization, _depth: number)}
	{#if org.parentOrganizationId}
		<span class="text-muted-foreground">{orgNameMap.get(org.parentOrganizationId) ?? '—'}</span>
	{:else}
		<span class="text-muted-foreground">—</span>
	{/if}
{/snippet}

<AddOrganization bind:organizations={fetchedOrgs} bind:addSheetOpen />
