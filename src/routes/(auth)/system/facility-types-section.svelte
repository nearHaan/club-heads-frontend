<script lang="ts">
	import {
		addFacilityType,
		loadRolesFacilityType,
		loadFacilityTypes,
		addFacilityTypeRole
	} from '$lib/api/facility-types';
	import RolePermissionSheet from '$lib/components/app/role-permission-sheet.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ChildType, LoadedData, RoleType, FacilityType } from '$lib/types';
	import { PencilIcon, PlusIcon, TrashIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let facilityTypes = $state<LoadedData<FacilityType[]>>({
		state: 'pending',
		message: 'Loading facility types...'
	});
	let facilityTypeChildren = $state<LoadedData<ChildType[]>>({
		state: 'pending',
		message: 'Loading children...'
	});
	let facilityTypeRoles = $state<LoadedData<RoleType[]>>({
		state: 'pending',
		message: 'Loading roles...'
	});
	let newFacilityTypeValue: string = $state('');
	let newRoleValue: string = $state('');
	let facilityTypeActiveTab: 'Roles' = $state('Roles');
	let activeFacilityType: FacilityType | null = $state(null);
	let selectedRole: RoleType | null = $state(null);

	let roleSheetOpen = $state(false);

	async function onSave() {
		if (!newFacilityTypeValue) return;
		const saveToastId = toast.loading('Saving new facility type...');
		try {
			const newType = await addFacilityType(newFacilityTypeValue);
			if (facilityTypes.state === 'success') {
				facilityTypes.data = [
					...facilityTypes.data,
					{
						id: newType.id,
						name: newFacilityTypeValue
					} //TODO: change selectedId type form string to ??(null)
				];
			}
			toast.success('Facility type Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save type', { id: saveToastId });
		} finally {
			newFacilityTypeValue = '';
		}
	}

	async function onRoleSave() {
		if (!newRoleValue || !activeFacilityType) return;
		const promise = addFacilityTypeRole(activeFacilityType?.id, newRoleValue);
		toast.promise(promise, {
			loading: 'Saving new role...',
			success: (newType) => {
				if (facilityTypeRoles.state === 'success') {
					facilityTypeRoles.data = [
						...facilityTypeRoles.data,
						{ id: newType.id, name: newRoleValue }
					];
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

	async function setActiveTab(tab: 'Roles') {
		if (!activeFacilityType) return;
		if (tab === 'Roles') {
			facilityTypeRoles = {
				state: 'pending',
				message: 'Loading Roles...'
			};
			facilityTypeRoles = {
				state: 'success',
				data: await loadRolesFacilityType(activeFacilityType.id)
			};
		}
		facilityTypeActiveTab = tab;
	}
	onMount(async () => {
		try {
			facilityTypes = {
				state: 'success',
				data: await loadFacilityTypes()
			};
		} catch (error) {
			facilityTypes = {
				state: 'failed',
				message: 'Failed to load users'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<div>
		<h3>Facility Types</h3>
		<p class="text-sm text-muted-foreground">
			Manage roles associated with each facility type here.
		</p>
	</div>
	<div class="">
		{#if facilityTypes.state === 'pending'}
			<div class="flex animate-pulse flex-col gap-0.5 rounded-sm">
				<div class="h-9 w-full rounded-t-sm bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full rounded-b-sm bg-muted"></div>
			</div>
		{:else if facilityTypes.state === 'success'}
			{#each facilityTypes.data as org}
				<button
					onclick={async () => {
						activeFacilityType = org;
						setActiveTab(facilityTypeActiveTab);
					}}
					class={[
						'flex w-full cursor-pointer justify-start border-x border-b border-foreground px-sm py-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b hover:bg-muted hover:underline',
						activeFacilityType?.id == org.id ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
					]}>{org.name}</button
				>
			{/each}
			<div
				class="flex w-full border-x border-b border-foreground p-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b max-sm:flex-col"
			>
				<input
					bind:value={newFacilityTypeValue}
					onchange={(e) => {
						newFacilityTypeValue = e.currentTarget.value;
					}}
					name="orgName"
					placeholder="New facility type"
					class="w-full rounded bg-muted p-xs"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {facilityTypes.message}</p>
		{/if}
	</div>
	{#if activeFacilityType !== null}
		<div class="rounded-sm border border-foreground">
			<h3 class="p-xs font-medium">{activeFacilityType?.name}</h3>
			<div class="flex gap-x-xxs">
				<TabButton onclick={setActiveTab} title="Roles" isActive={true} />
			</div>
			<div class="border-t border-muted-foreground">
				{#if facilityTypeRoles.state === 'pending'}
					<p class="p-xs">{facilityTypeRoles.message}</p>
				{:else if facilityTypeRoles.state === 'success'}
					{#each facilityTypeRoles.data as role}
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
					<p class="p-xs">Failed to Load: {facilityTypeRoles.message}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if activeFacilityType && selectedRole}
	<RolePermissionSheet
		title={'Institution'}
		org={activeFacilityType!}
		role={selectedRole!}
		bind:open={roleSheetOpen}
	/>
{/if}
