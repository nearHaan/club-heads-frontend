<script lang="ts">
	import { page } from '$app/state';
	import { DatabasePlus, UserPlus, X } from '@lucide/svelte';
	import type { LoadedData, EntityMember, Role, ActionMenuItem, Facility } from '$lib/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import DataTableActions from '$lib/components/app/data-table-actions.svelte';
	import AddMember from './add-member.svelte';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import { nav } from '../../header.svelte';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import {
		changeFacilityAvailability,
		deleteProviderOfFacility,
		getFacilityById,
		loadFacilityMembers
	} from '$lib/api/facilities';
	import { loadRolesFacilityType } from '$lib/api/facility-types';
	import AddProvider from './add-provider.svelte';
	import { toast } from 'svelte-sonner';

	let addSheetOpen = $state(false);
	let addProviderSheetOpen = $state(false);
	let searchValue = $state('');

	let facility = $state<LoadedData<Facility>>({
		state: 'pending',
		message: 'Loading facility details...'
	});

	let facilityMembers = $state<LoadedData<EntityMember[]>>({
		state: 'pending',
		message: 'Loading members...'
	});

	let roles = $state<LoadedData<Role[]>>({
		state: 'pending',
		message: 'Loading roles...'
	});

	function getRolesText(member: EntityMember) {
		if (roles.state === 'pending') {
			return 'Loading';
		} else if (roles.state === 'success') {
			const rolesData = roles.data;
			return member.roles.reduce((acc: string, role) => {
				const name = rolesData.find((_role) => _role.id === role.roleId)?.name ?? '';
				return acc ? acc + ', ' + name : acc + name;
			}, '');
		}
		return 'undefined';
	}

	const optionsList: ActionMenuItem<EntityMember>[] = [
		{
			id: 1,
			name: 'Edit Role(s)',
			onclick: (row) => {
				selectedMember = row;
				addSheetOpen = true;
			}
		}
	];

	let selectedMember: null | EntityMember = $state(null);
	let facilityId = $derived(Number(page.params.id!));

	let filteredMembers = $derived.by<EntityMember[]>(() => {
		if (facilityMembers.state !== 'success') return [];
		if (!searchValue) return facilityMembers.data;
		const lower = searchValue.toLowerCase().trim();
		return facilityMembers.data.filter(
			(member) =>
				member.fullName.toLowerCase().includes(lower) || member.email?.toLowerCase().includes(lower)
		);
	});

	$effect(() => {
		nav.set([{ title: 'facilities', url: '/facilities' }]);

		(async () => {
			try {
				facility = {
					state: 'success',
					data: await getFacilityById(facilityId)
				};
				nav.set([
					{ title: 'Facilities', url: '/facilities' },
					{ title: facility.data.name, url: `/facilities/${facility.data.id}` }
				]);
			} catch (err) {
				facility = {
					state: 'failed',
					message: 'Failed to load facility details'
				};
			}
			try {
				facilityMembers = {
					state: 'success',
					data: await loadFacilityMembers(facilityId)
				};
			} catch (err) {
				facilityMembers = {
					state: 'failed',
					message: 'Failed to load members'
				};
			}
			if (facility.state === 'success') {
				try {
					roles = {
						state: 'success',
						data: await loadRolesFacilityType(facility.data.type.id)
					};
				} catch (err) {
					roles = {
						state: 'failed',
						message: 'Failed to load roles'
					};
				}
			} else {
				roles = {
					state: 'failed',
					message: 'Roles unavailable'
				};
			}
		})();
	});

	async function deleteProvider(providerId: number) {
		if (facility.state !== 'success') return;
		try {
			await deleteProviderOfFacility(facility.data.id, providerId);
			facility.data.providers = facility.data.providers.filter((p) => p.id !== providerId);
		} catch (err: any) {
			//
		}
	}

	let canAddMember = $derived(permissionGrantedSomewhere('facility:create'));

	let isMarkingavailablility = $state(false);
</script>

<div class="mx-auto w-full max-w-prose pb-16">
	<div class="sticky top-12 z-40 flex gap-xs bg-background p-3">
		<div class="flex w-full place-items-center gap-2">
			<SearchInput bind:value={searchValue} placeholder="Search members..." />
		</div>
	</div>

	<div class="space-y-4">
		{#if facility.state === 'success'}
			<div class="space-y-2 px-3">
				<div class="flex place-items-center justify-between">
					<p class="text-lg font-medium">Providers</p>
					<Button
						class="has-[>svg]:p-0"
						size="icon-sm"
						variant="ghost"
						onclick={() => {
							addProviderSheetOpen = true;
						}}
					>
						<DatabasePlus />
					</Button>
				</div>
				<div class="flex flex-col gap-y-4">
					<div class="rounded-sm border bg-background">
						{#if facility.data.providers.length === 0}
							<div class="flex w-full justify-center py-6 text-xs text-muted-foreground">
								No providers yet
							</div>
						{/if}
						{#each facility.data.providers as provider, index (provider.id ?? index)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 hover:bg-accent/50"
								onclick={() => {
									//
								}}
							>
								<div class="flex min-w-0 flex-1 flex-col">
									<span class="text-sm font-medium">{provider.scope.name}</span>
									<span class="truncate text-xs text-muted-foreground"
										>{provider.scope.kind.name}</span
									>
								</div>
								{#if canAddMember}
									<Button
										class="has-[>svg]:p-0"
										size="icon-sm"
										variant="ghost"
										onclick={() => {
											deleteProvider(provider.id);
										}}
									>
										<X />
									</Button>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
		<div class="space-y-2 px-3">
			<div class="flex place-items-center justify-between">
				<p class="text-lg font-medium">Members</p>
				<Button
					class="has-[>svg]:p-0"
					size="icon-sm"
					variant="ghost"
					onclick={() => {
						selectedMember = null;
						addSheetOpen = true;
					}}
				>
					<UserPlus />
				</Button>
			</div>
			<div class="flex flex-col gap-y-4">
				{#if facilityMembers.state === 'pending'}
					<p class="p-4 text-center text-sm text-muted-foreground">{facilityMembers.message}</p>
				{:else if facilityMembers.state === 'success'}
					<div class="rounded-sm border bg-background">
						{#each filteredMembers as member, index (member.id ?? index)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 hover:bg-accent/50"
								onclick={() => {
									selectedMember = member;
									addSheetOpen = true;
								}}
							>
								<ShapeAvatarSvg
									seed={member.fullName}
									size={32}
									styleName={'thumb'}
									class="rounded-xs"
								/>
								<div class="flex min-w-0 flex-1 flex-col">
									<span class="text-sm font-medium">{member.fullName}</span>
									{#if member.email}
										<span class="truncate text-xs text-muted-foreground">{member.email}</span>
									{/if}
									<span class="truncate text-xs text-muted-foreground">{getRolesText(member)}</span>
								</div>
								{#if canAddMember}
									<div class="flex items-center justify-end" onclick={(e) => e.stopPropagation()}>
										<DataTableActions selectedItem={member} actions={optionsList} />
									</div>
								{/if}
							</div>
						{/each}
						{#if filteredMembers.length === 0}
							<div class="p-4 text-center text-sm text-muted-foreground">No members found.</div>
						{/if}
					</div>
				{:else}
					<p class="p-4 text-center text-red-500">{facilityMembers.message}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if facility.state === 'success'}
		<div class="px-3">
			<div>
				<div>Facility availability</div>
				<Button
					disabled={isMarkingavailablility}
					onclick={async () => {
						if (facility.state !== 'success') return;
						isMarkingavailablility = true;
						try {
							await changeFacilityAvailability(facility.data.id, !facility.data.isAvailable);
							facility.data.isAvailable = !facility.data.isAvailable;
						} catch {
							toast.error('Something went wrong');
						} finally {
							isMarkingavailablility = false;
						}
					}}>Mark as {facility.data.isAvailable ? 'Unavailable' : 'Available'}</Button
				>
			</div>
		</div>
	{/if}
</div>

{#if facilityMembers.state === 'success' && roles.state === 'success'}
	<AddMember
		bind:member={selectedMember}
		id={facilityId}
		roles={roles.data}
		bind:open={addSheetOpen}
	/>
{/if}
{#if facility.state === 'success'}
	<AddProvider bind:facility={facility.data} bind:open={addProviderSheetOpen} />
{/if}
