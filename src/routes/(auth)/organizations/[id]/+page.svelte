<script lang="ts">
	import { page } from '$app/state';
	import { UserPlus } from '@lucide/svelte';
	import type { LoadedData, Organization, EntityMember, Role, ActionMenuItem } from '$lib/types';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getOrgById, loadOrganizationMembers, loadRolesOrgType } from '$lib/api/organizations';
	import DataTableActions from '$lib/components/app/data-table-actions.svelte';
	import AddMember from './add-member.svelte';
	import { permissionGrantedSomewhere } from '$lib/helpers';
	import { nav } from '../../header.svelte';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';

	let addSheetOpen = $state(false);
	let searchValue = $state('');

	let org = $state<LoadedData<Organization>>({
		state: 'pending',
		message: 'Loading organization details...'
	});

	let orgMembers = $state<LoadedData<EntityMember[]>>({
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
	let organizationId = $derived(Number(page.params.id!));

	let filteredMembers = $derived.by<EntityMember[]>(() => {
		if (orgMembers.state !== 'success') return [];
		if (!searchValue) return orgMembers.data;
		const lower = searchValue.toLowerCase().trim();
		return orgMembers.data.filter(
			(member) =>
				member.fullName.toLowerCase().includes(lower) || member.email?.toLowerCase().includes(lower)
		);
	});

	$effect(() => {
		nav.set([{ title: 'Organizations', url: '/organizations' }]);

		(async () => {
			try {
				org = {
					state: 'success',
					data: await getOrgById(organizationId)
				};
				nav.set([
					{ title: 'Organizations', url: '/organizations' },
					{ title: org.data.name, url: `/organizations/${org.data.id}` }
				]);
			} catch (err) {
				org = {
					state: 'failed',
					message: 'Failed to load organization details'
				};
			}
			try {
				orgMembers = {
					state: 'success',
					data: await loadOrganizationMembers(organizationId)
				};
			} catch (err) {
				orgMembers = {
					state: 'failed',
					message: 'Failed to load members'
				};
			}
			if (org.state === 'success') {
				try {
					roles = {
						state: 'success',
						data: await loadRolesOrgType(org.data.organizationTypeId)
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

	let canAddMember = $derived(permissionGrantedSomewhere('organization:add_member'));
</script>

<div class="mx-auto w-full max-w-prose">
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

	<div class="flex flex-col gap-y-4 p-r-pad">
		{#if orgMembers.state === 'pending'}
			<p class="p-4 text-center text-sm text-muted-foreground">{orgMembers.message}</p>
		{:else if orgMembers.state === 'success'}
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
			<p>{orgMembers.message}</p>
		{/if}
	</div>
</div>

{#if orgMembers.state === 'success' && roles.state === 'success'}
	<AddMember
		bind:member={selectedMember}
		id={organizationId}
		roles={roles.data}
		bind:open={addSheetOpen}
	/>
{/if}
