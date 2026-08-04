<script lang="ts">
	import {
		addChildOrgType,
		addOrgType,
		addOrganizationTypeRole,
		loadChildrenOrgType,
		loadOrgTypes,
		loadRolesOrgType
	} from '$lib/api/organizations';
	import RolePermissionSheet from '$lib/components/app/role-permission-sheet.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { ChildType, LoadedData, OrganizationType, RoleType } from '$lib/types';
	import { PencilIcon, PlusIcon, TrashIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let orgTypes = $state<LoadedData<OrganizationType[]>>({
		state: 'pending',
		message: 'Loading organizations...'
	});
	let orgTypeChildren = $state<LoadedData<ChildType[]>>({
		state: 'pending',
		message: 'Loading children...'
	});
	let orgTypeRoles = $state<LoadedData<RoleType[]>>({
		state: 'pending',
		message: 'Loading roles...'
	});
	let newOrgTypeValue: string = $state('');
	let newRoleValue: string = $state('');
	let orgTypeActiveTab: 'Children' | 'Roles' = $state('Roles');
	let activeOrgTpe: OrganizationType | null = $state(null);
	let selectedRole: RoleType | null = $state(null);

	let roleSheetOpen = $state(false);

	async function onSave() {
		if (!newOrgTypeValue) return;
		const saveToastId = toast.loading('Saving new organization type...');
		try {
			const newType = await addOrgType(newOrgTypeValue);
			if (orgTypes.state === 'success') {
				orgTypes.data = [
					...orgTypes.data,
					{
						id: newType.id,
						name: newOrgTypeValue,
						children: [],
						selectedChildId: null,
						selectedRoleId: null
					} //TODO: change selectedId type form string to ??(null)
				];
			}
			toast.success('Organization Type Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save type', { id: saveToastId });
		} finally {
			newOrgTypeValue = '';
		}
	}

	async function onChildAdd(parentId: number, childId: number) {
		if (!parentId || !childId) return;
		const promise = addChildOrgType(parentId, childId);
		toast.promise(promise, {
			loading: 'Adding Child type...',
			success: (res) => {
				console.log('Added child');
				if (orgTypeChildren.state === 'success' && orgTypes.state === 'success') {
					orgTypeChildren.data = [
						...orgTypeChildren.data,
						{
							id: childId,
							name:
								orgTypes.data.find((item) => item.id === activeOrgTpe?.selectedChildId)?.name ?? ''
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
				newOrgTypeValue = '';
			}
		});
	}

	async function onRoleSave() {
		if (!newRoleValue || !activeOrgTpe) return;
		const promise = addOrganizationTypeRole(activeOrgTpe?.id, newRoleValue);
		toast.promise(promise, {
			loading: 'Saving new role...',
			success: (newType) => {
				if (orgTypeRoles.state === 'success') {
					orgTypeRoles.data = [...orgTypeRoles.data, { id: newType.id, name: newRoleValue }];
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
		if (!activeOrgTpe) return;
		if (tab === 'Children') {
			orgTypeChildren = {
				state: 'pending',
				message: 'Loading Children...'
			};
			orgTypeChildren = {
				state: 'success',
				data: await loadChildrenOrgType(activeOrgTpe.id)
			};
		} else {
			orgTypeRoles = {
				state: 'pending',
				message: 'Loading Roles...'
			};
			orgTypeRoles = {
				state: 'success',
				data: await loadRolesOrgType(activeOrgTpe.id)
			};
		}
		orgTypeActiveTab = tab;
	}
	onMount(async () => {
		try {
			orgTypes = {
				state: 'success',
				data: await loadOrgTypes()
			};
		} catch (error) {
			orgTypes = {
				state: 'failed',
				message: 'Failed to load users'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<div>
		<h3>Organization Types</h3>
		<p class="text-sm text-muted-foreground">
			Manage children and roles associated with each organization type here. Select an item to
			manage its entities
		</p>
	</div>
	<div class="">
		{#if orgTypes.state === 'pending'}
			<div class="flex animate-pulse flex-col gap-0.5 rounded-sm">
				<div class="h-9 w-full rounded-t-sm bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full rounded-b-sm bg-muted"></div>
			</div>
		{:else if orgTypes.state === 'success'}
			{#each orgTypes.data as org}
				<button
					onclick={async () => {
						activeOrgTpe = org;
						setActiveTab(orgTypeActiveTab);
					}}
					class={[
						'flex w-full cursor-pointer justify-start border-x border-b border-foreground px-sm py-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b hover:bg-muted hover:underline',
						activeOrgTpe?.id == org.id ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
					]}>{org.name}</button
				>
			{/each}
			<div
				class="flex w-full border-x border-b border-foreground p-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b max-sm:flex-col"
			>
				<input
					bind:value={newOrgTypeValue}
					onchange={(e) => {
						newOrgTypeValue = e.currentTarget.value;
					}}
					name="orgName"
					placeholder="New Organization type"
					class="w-full rounded bg-muted p-xs"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {orgTypes.message}</p>
		{/if}
	</div>
	{#if activeOrgTpe !== null}
		<div class="rounded-sm border border-foreground">
			<h3 class="p-xs font-medium">{activeOrgTpe?.name}</h3>
			<div class="flex gap-x-xxs">
				<TabButton
					onclick={setActiveTab}
					title="Children"
					isActive={orgTypeActiveTab === 'Children'}
				/>
				<TabButton onclick={setActiveTab} title="Roles" isActive={orgTypeActiveTab === 'Roles'} />
			</div>
			<div class="border-t border-muted-foreground">
				{#if orgTypeActiveTab === 'Children'}
					{#if orgTypeChildren.state === 'pending'}
						<p class="p-xs">{orgTypeChildren.message}</p>
					{:else if orgTypeChildren.state === 'success' && orgTypes.state === 'success'}
						{@const selectTrigCont =
							orgTypes.data.find((item) => item.id === activeOrgTpe?.selectedChildId)?.name ??
							'Select a child'}
						{@const selectItems = orgTypes.data
							.filter(
								(item) =>
									orgTypeChildren.state === 'success' &&
									orgTypeChildren.data.findIndex((child) => child.id === item.id) === -1
							)
							.map((item) => ({ value: item.id, label: item.name }))}
						{#each orgTypeChildren.data as child}
							<Button
								class="w-full justify-start rounded-none border-b border-b-muted-foreground text-sm text-secondary-foreground"
								variant="link">{child.name}</Button
							>
						{/each}
						<div class="flex w-full p-xs text-sm max-sm:flex-col">
							<SelectButton
								name="Organization"
								class="w-full rounded border-0 bg-muted p-xs"
								bind:value={activeOrgTpe.selectedChildId!}
								itemsList={selectItems}
								optionName="label"
								optionValue="value"
							/>
							<Button
								onclick={() => {
									onChildAdd(activeOrgTpe!.id, activeOrgTpe!.selectedChildId!);
								}}
								variant="link"><PlusIcon /> Add</Button
							>
						</div>
					{:else if orgTypeChildren.state === 'failed'}
						<p class="p-xs">Failed to Load: {orgTypeChildren.message}</p>
					{/if}
				{:else if orgTypeActiveTab === 'Roles'}
					{#if orgTypeRoles.state === 'pending'}
						<p class="p-xs">{orgTypeRoles.message}</p>
					{:else if orgTypeRoles.state === 'success'}
						{#each orgTypeRoles.data as role}
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
						<p class="p-xs">Failed to Load: {orgTypeRoles.message}</p>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if activeOrgTpe && selectedRole}
	<RolePermissionSheet
		title={'Institution'}
		org={activeOrgTpe!}
		role={selectedRole!}
		bind:open={roleSheetOpen}
	/>
{/if}
