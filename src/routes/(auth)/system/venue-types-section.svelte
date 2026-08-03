<script lang="ts">
	import { addVenueTypeRole } from '$lib/api/venue';
	import {
		addChildVenueType,
		addVenueType,
		loadChildrenVenueType,
		loadRolesVenueType,
		loadVenueTypes
	} from '$lib/api/venues';
	import RolePermissionSheet from '$lib/components/app/role-permission-sheet.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { ChildType, LoadedData, RoleType, VenueType } from '$lib/types';
	import { PencilIcon, PlusIcon, TrashIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let venueTypes = $state<LoadedData<VenueType[]>>({
		state: 'pending',
		message: 'Loading venue types...'
	});
	let venueTypeChildren = $state<LoadedData<ChildType[]>>({
		state: 'pending',
		message: 'Loading children...'
	});
	let venueTypeRoles = $state<LoadedData<RoleType[]>>({
		state: 'pending',
		message: 'Loading roles...'
	});
	let newVenueTypeValue: string = $state('');
	let newRoleValue: string = $state('');
	let venueTypeActiveTab: 'Children' | 'Roles' = $state('Roles');
	let activeVenueType: VenueType | null = $state(null);
	let selectedRole: RoleType | null = $state(null);

	let roleSheetOpen = $state(false);

	async function onSave() {
		if (!newVenueTypeValue) return;
		const saveToastId = toast.loading('Saving new venue type...');
		try {
			const newType = await addVenueType(newVenueTypeValue);
			if (venueTypes.state === 'success') {
				venueTypes.data = [
					...venueTypes.data,
					{
						id: newType.id,
						name: newVenueTypeValue,
						children: [],
						selectedChildId: null,
						selectedRoleId: null
					} //TODO: change selectedId type form string to ??(null)
				];
			}
			toast.success('Venue Type Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save type', { id: saveToastId });
		} finally {
			newVenueTypeValue = '';
		}
	}

	async function onChildAdd(parentId: number, childId: number) {
		if (!parentId || !childId) return;
		const promise = addChildVenueType(parentId, childId);
		toast.promise(promise, {
			loading: 'Adding Child type...',
			success: (res) => {
				console.log('Added child');
				if (venueTypeChildren.state === 'success' && venueTypes.state === 'success') {
					venueTypeChildren.data = [
						...venueTypeChildren.data,
						{
							id: childId,
							name:
								venueTypes.data.find((item) => item.id === activeVenueType?.selectedChildId)
									?.name ?? ''
						}
					];
				}
				return 'Saved successfully';
			},
			error: (err) => {
				console.error(err);
				return 'Failed add type';
			},
			finally: () => {
				newVenueTypeValue = '';
			}
		});
	}

	async function onRoleSave() {
		if (!newRoleValue || !activeVenueType) return;
		const promise = addVenueTypeRole(activeVenueType?.id, newRoleValue);
		toast.promise(promise, {
			loading: 'Saving new role...',
			success: (newType) => {
				if (venueTypeRoles.state === 'success') {
					venueTypeRoles.data = [...venueTypeRoles.data, { id: newType.id, name: newRoleValue }];
				}
				return 'Role Saved';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to save role';
			},
			finally: () => {
				newRoleValue = '';
			}
		});
	}

	async function setActiveTab(tab: 'Children' | 'Roles') {
		if (!activeVenueType) return;
		if (tab === 'Children') {
			venueTypeChildren = {
				state: 'pending',
				message: 'Loading Children...'
			};
			venueTypeChildren = {
				state: 'success',
				data: await loadChildrenVenueType(activeVenueType.id)
			};
		} else {
			venueTypeRoles = {
				state: 'pending',
				message: 'Loading Roles...'
			};
			venueTypeRoles = {
				state: 'success',
				data: await loadRolesVenueType(activeVenueType.id)
			};
		}
		venueTypeActiveTab = tab;
	}
	onMount(async () => {
		try {
			venueTypes = {
				state: 'success',
				data: await loadVenueTypes()
			};
		} catch (error) {
			venueTypes = {
				state: 'failed',
				message: 'Failed to load users'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<h3>Venue Types</h3>
	<p class="text-sm text-muted-foreground">
		Manage children and roles associated with each venue type here. Select an item to manage its
		entities
	</p>
	<div class="">
		{#if venueTypes.state === 'pending'}
			<div class="flex animate-pulse flex-col gap-0.5 rounded-sm">
				<div class="h-9 w-full rounded-t-sm bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full rounded-b-sm bg-muted"></div>
			</div>
		{:else if venueTypes.state === 'success'}
			{#each venueTypes.data as org}
				<button
					onclick={async () => {
						activeVenueType = org;
						setActiveTab(venueTypeActiveTab);
					}}
					class={[
						'flex w-full cursor-pointer justify-start border-x border-b border-foreground px-sm py-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b hover:bg-muted hover:underline',
						activeVenueType?.id == org.id ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
					]}>{org.name}</button
				>
			{/each}
			<div
				class="flex w-full border-x border-b border-foreground p-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b max-sm:flex-col"
			>
				<input
					bind:value={newVenueTypeValue}
					onchange={(e) => {
						newVenueTypeValue = e.currentTarget.value;
					}}
					name="orgName"
					placeholder="New Organization type"
					class="w-full rounded bg-muted p-xs"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {venueTypes.message}</p>
		{/if}
	</div>
	{#if activeVenueType !== null}
		<div class="rounded-sm border border-foreground">
			<h3 class="p-xs font-medium">{activeVenueType?.name}</h3>
			<div class="flex gap-x-xxs">
				<TabButton onclick={setActiveTab} title="Roles" isActive={true} />
			</div>
			<div class="border-t border-muted-foreground">
				{#if venueTypeRoles.state === 'pending'}
					<p class="p-xs">{venueTypeRoles.message}</p>
				{:else if venueTypeRoles.state === 'success'}
					{#each venueTypeRoles.data as role}
						<div
							class="flex w-full items-center justify-start rounded-none border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
						>
							<p class="w-full">{role.name}</p>
							<Button
								onclick={() => {
									selectedRole = role;
									roleSheetOpen = true;
								}}
								size="icon"
								variant="ghost"><PencilIcon /></Button
							>
							<Button class="text-red-400" size="icon" variant="ghost"><TrashIcon /></Button>
						</div>
					{/each}
					<div class="flex w-full p-xs text-sm max-sm:flex-col">
						<input
							bind:value={newRoleValue}
							onchange={(e) => {
								newRoleValue = e.currentTarget.value;
							}}
							name="orgName"
							placeholder="New Role"
							class="w-full rounded bg-muted p-xs"
							type="text"
						/>
						<Button onclick={onRoleSave} variant="link"><PlusIcon /> Add</Button>
					</div>
				{:else}
					<p class="p-xs">Failed to Load: {venueTypeRoles.message}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if activeVenueType && selectedRole}
	<RolePermissionSheet
		title={'Institution'}
		org={activeVenueType!}
		role={selectedRole!}
		bind:open={roleSheetOpen}
	/>
{/if}
