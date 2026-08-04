<script lang="ts">
	import { page } from '$app/state';
	import { UserPlus } from '@lucide/svelte';
	import type { LoadedData, EntityMember, Role, ActionMenuItem, Venue } from '$lib/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getVenueById, loadVenueMembers } from '$lib/api/venue';
	import { loadRolesVenueType } from '$lib/api/venues';
	import DataTableActions from '$lib/components/app/data-table-actions.svelte';
	import AddMember from './add-member.svelte';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import { nav } from '../../header.svelte';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';

	let addSheetOpen = $state(false);
	let searchValue = $state('');

	let venue = $state<LoadedData<Venue>>({
		state: 'pending',
		message: 'Loading venue details...'
	});

	let venueMembers = $state<LoadedData<EntityMember[]>>({
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
			return member.roles.reduce((acc: string, role, i) => {
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
	let venueId = $derived(Number(page.params.id!));

	let filteredMembers = $derived.by<EntityMember[]>(() => {
		if (venueMembers.state !== 'success') return [];
		if (!searchValue) return venueMembers.data;
		const lower = searchValue.toLowerCase().trim();
		return venueMembers.data.filter(
			(member) =>
				member.fullName.toLowerCase().includes(lower) || member.email?.toLowerCase().includes(lower)
		);
	});

	$effect(() => {
		nav.set([{ title: 'Venues', url: '/venues' }]);

		(async () => {
			try {
				venue = {
					state: 'success',
					data: await getVenueById(venueId)
				};
				nav.set([
					{ title: 'Venues', url: '/venues' },
					{ title: venue.data.name, url: `/venues/${venue.data.id}` }
				]);
			} catch (err) {
				venue = {
					state: 'failed',
					message: 'Failed to load venue details'
				};
			}
			try {
				venueMembers = {
					state: 'success',
					data: await loadVenueMembers(venueId)
				};
			} catch (err) {
				venueMembers = {
					state: 'failed',
					message: 'Failed to load members'
				};
			}
			if (venue.state === 'success') {
				try {
					roles = {
						state: 'success',
						data: await loadRolesVenueType(venue.data.venueTypeId)
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

	let canAddMember = $derived(permissionGrantedSomewhere('venue:add_member'));
</script>

<div class="mx-auto w-full max-w-prose pb-16">
	<div class="sticky top-12 z-40 flex gap-xs bg-background p-3">
		<div class="flex w-full place-items-center gap-2">
			<SearchInput bind:value={searchValue} placeholder="Search members..." />

			{#if canAddMember}
				<Button
					class="hidden md:inline-flex"
					onclick={() => {
						selectedMember = null;
						addSheetOpen = true;
					}}>Manage Members</Button
				>
				<Button
					class="md:hidden"
					size="icon"
					onclick={() => {
						selectedMember = null;
						addSheetOpen = true;
					}}
				>
					<UserPlus />
				</Button>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-y-4 p-r-pad px-3">
		{#if venueMembers.state === 'pending'}
			<p class="p-4 text-center text-sm text-muted-foreground">{venueMembers.message}</p>
		{:else if venueMembers.state === 'success'}
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
			<p class="p-4 text-center text-red-500">{venueMembers.message}</p>
		{/if}
	</div>
</div>

{#if venueMembers.state === 'success' && roles.state === 'success'}
	<AddMember
		bind:member={selectedMember}
		id={venueId}
		roles={roles.data}
		bind:open={addSheetOpen}
	/>
{/if}
