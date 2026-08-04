<!-- TODO: Make this sheet reusable for both venues and organization -->
<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { ApiFailure, LoadedData, EntityMember, Role } from '$lib/types';
	import { PlusIcon, TrashIcon, Loader, X } from '@lucide/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { deleteVenueMember, getVenueMemberByEmail, updateVenueMemberRoles } from '$lib/api/venue';
	import SideSheet from '$lib/components/app/side-sheet.svelte';

	let userId: number | null = $state(null);
	let userRoles = $state<LoadedData<EntityMember['roles']>>({
		state: 'pending',
		message: 'Loading Roles'
	});
	let currentRoles: EntityMember['roles'] = $state([]);

	let userName = $state('');
	let emailValue = $state('');
	let errorText = $state('');
	let isLoadBtnActive = $state(true);
	let isRoleLoading = $state(false);
	let isSaveBtnActive = $derived(
		(!(
			userRoles.state === 'success' &&
			userRoles.data.every((role) => currentRoles.find((_role) => _role.roleId === role.roleId))
		) &&
			currentRoles.length >= 1) ||
			(userRoles.state === 'success' &&
				userRoles.data.length !== currentRoles.length &&
				currentRoles.length >= 1)
	);
	let saved = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let delOpen = $state(false);

	let selectedRoleId: null | number = $state(null);

	let {
		member = $bindable(),
		id,
		roles,
		open = $bindable()
	}: { member: EntityMember | null; id: number; roles: Role[]; open: boolean } = $props();

	let possibleRoles = $derived.by(() => {
		if (userRoles.state === 'success') {
			return roles.filter((_role) => !currentRoles.find((__role) => __role.roleId === _role.id));
		}
		return [];
	});

	async function loadRoles() {
		try {
			errorText = '';
			if (emailValue.trim().length === 0) return;
			isRoleLoading = true;
			isLoadBtnActive = false;
			const member = await getVenueMemberByEmail(id, emailValue);
			userRoles = {
				state: 'success',
				data: member.roles
			};
			userId = member.id;
			userName = member.fullName;
			currentRoles = member.roles;
		} catch (error: any) {
			const err = error as ApiFailure;
			console.log(err.message);
			errorText = err.message;
			isLoadBtnActive = true;
			userRoles = {
				state: 'failed',
				message: 'Failed to fetch user roles'
			};
		} finally {
			isRoleLoading = false;
		}
	}

	async function updateRoles() {
		try {
			errorText = '';
			if (userRoles.state !== 'success') return;
			isSaving = true;
			await updateVenueMemberRoles(
				id,
				userId!,
				currentRoles.map((role) => role.roleId)
			);
			saved = true;
			userRoles = {
				state: 'success',
				data: currentRoles
			};
		} catch (error: any) {
			const err = error as ApiFailure;
			console.log(err.message);
			errorText = err.message;
		} finally {
			isSaving = false;
		}
	}

	async function deleteMember() {
		try {
			errorText = '';
			if (userRoles.state !== 'success') return;
			isDeleting = true;
			await deleteVenueMember(id, userId!);
			clearUser();
			open = false;
		} catch (error: any) {
			const err = error as ApiFailure;
			console.log(err.message);
			errorText = err.message;
		} finally {
			isDeleting = false;
		}
	}

	function clearUser() {
		member = null;
		saved = false;
		userId = null;
		errorText = '';
		emailValue = '';
		isLoadBtnActive = true;
	}

	$effect(() => {
		if (member) {
			emailValue = member.email;
			loadRoles();
		} else {
			clearUser();
		}
	});
</script>

<SideSheet
	bind:sheetOpen={open}
	title="Manage members"
	description="Enter the email address to add/edit member roles"
	{errorText}
>
	<form class="flex h-full flex-col">
		<div class="flex h-full flex-col gap-y-6">
			<div class="mx-0 flex flex-col gap-y-xxs">
				<Label for="email" class="text-sm">Email</Label>
				{#if isLoadBtnActive}
					<Input name="email" type="email" bind:value={emailValue} />
				{:else}
					<div class="flex items-center justify-between border-2 px-3 py-1 text-primary">
						<p>{emailValue}</p>
						<Button
							onclick={clearUser}
							class="cursor-pointer text-foreground"
							variant="link"
							size="icon-sm"><X /></Button
						>
					</div>
				{/if}
				<div class="flex justify-end">
					<Button
						class="w-full cursor-pointer border"
						onclick={loadRoles}
						disabled={!isLoadBtnActive}
						variant="link"
						>Load/Add Roles {#if isRoleLoading}
							<Loader class="animate-spin" />
						{/if}</Button
					>
				</div>
			</div>
			{#if !isLoadBtnActive && !isRoleLoading}
				<div class="flex h-full flex-col gap-y-4">
					<div class="flex flex-col gap-y-xxs">
						<h3 class="text-sm font-medium">Name</h3>
						<div class="flex items-center justify-between border px-3 py-1 text-foreground">
							<p>{userName}</p>
						</div>
					</div>
					<div class="flex flex-col gap-y-xxs">
						<h3 class="text-sm font-medium">Role(s)</h3>
						<div class="border border-muted-foreground bg-muted">
							{#if userRoles.state === 'pending'}
								<p class="p-xs text-sm">{userRoles.message}</p>
							{:else if userRoles.state === 'success'}
								{#each currentRoles as role}
									<div
										class="flex w-full items-center justify-start rounded-none border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
									>
										<p class="w-full py-xs">
											{roles.find((_role) => _role.id === role.roleId)?.name}
										</p>
										<Button
											onclick={() => {
												errorText = '';
												saved = false;
												currentRoles = currentRoles.filter((_role) => _role.roleId !== role.roleId);
											}}
											class="text-red-400"
											size="icon"
											variant="ghost"><TrashIcon /></Button
										>
									</div>
								{/each}

								<div class="flex">
									<SelectButton
										name="role"
										class="w-full"
										bind:value={selectedRoleId!}
										itemsList={possibleRoles}
										optionName="name"
										optionValue="id"
									/>
									<Button
										variant="link"
										onclick={() => {
											errorText = '';
											if (!selectedRoleId) return;
											currentRoles = [
												...currentRoles,
												{ id: 0, isActive: true, roleId: selectedRoleId }
											];
											selectedRoleId = null;
											saved = false;
										}}
										class="rounded-none"><PlusIcon />Add</Button
									>
								</div>
							{:else}
								<p class="p-xs text-sm">Failed to load facilities.</p>
							{/if}
						</div>
					</div>

					{#if userRoles.state === 'success' && userRoles.data.length !== 0}
						{#if !delOpen}
							<Button
								onclick={() => (delOpen = true)}
								class="cursor-pointer bg-muted text-red-500"
								variant="secondary">Delete Member</Button
							>
						{:else}
							<div class="flex flex-col gap-y-xs bg-muted p-xs">
								<p class="text-sm text-muted-foreground">
									This action will remove the user from this venue, but will not delete the user.
									This action cannot be undone.
								</p>
								<Button onclick={deleteMember} variant="destructive"
									>Delete Member {#if isDeleting}
										<Loader class="animate-spin" />
									{/if}</Button
								>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button
				class={`${saved ? 'bg-green-700 text-background' : ''}`}
				onclick={updateRoles}
				disabled={!isSaveBtnActive || saved}
				>{saved ? 'Saved Successfully' : 'Save'}
				{#if isSaving}
					<Loader class="animate-spin" />
				{/if}</Button
			>
			<Sheet.Close class={`${buttonVariants({ variant: 'outline' })} flex-1`}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
