<script lang="ts">
	import { loadPermissions, loadRolePerms, updateRolePermissions } from '$lib/api/permissions';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type {
		FacilityType,
		LoadedData,
		OrganizationType,
		PermissionChildType,
		PermissionType,
		RoleType,
		VenueType
	} from '$lib/types';
	import Checkbox from '../ui/checkbox/checkbox.svelte';
	import SideSheet from './side-sheet.svelte';

	let {
		open = $bindable(false),
		title,
		org,
		role
	}: {
		open: boolean;
		title: string;
		org: OrganizationType | VenueType | FacilityType;
		role: RoleType;
	} = $props();

	let errorText = $state('');

	let permissionSet = $state<LoadedData<PermissionType[]>>({
		state: 'pending',
		message: 'Loading Permissions...'
	});

	let rolePermissionSet = $state<LoadedData<PermissionType[]>>({
		state: 'pending',
		message: 'Loading role permissions...'
	});

	let permissionWithScope = $state<Record<string, PermissionChildType[]>>({});
	let saveDisabled = $state(true);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		let resList: number[] = [];
		Object.entries(permissionWithScope).forEach(([scope, value]) => {
			value.forEach((permission) => {
				if (permission.status) {
					resList.push(permission.id);
				}
			});
		});
		try {
			errorText = '';

			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name') as string;

			if (await updateRolePermissions(role.id, resList)) {
				console.log('Updated Permissions');
				open = false;
			}
		} catch (err: any) {
			errorText = err.message;
		}
	}

	function isScopeChecked(scope: string) {
		return permissionWithScope[scope].every((item) => item.status === true);
	}

	function isScopeIndeterminate(scope: string) {
		return (
			permissionWithScope[scope].some((item) => item.status === true) &&
			!permissionWithScope[scope].every((item) => item.status === true)
		);
	}

	$effect(() => {
		let sync = { role, org };
		(async () => {
			permissionSet = {
				state: 'pending',
				message: 'Loading Permissions...'
			};
			rolePermissionSet = {
				state: 'pending',
				message: 'Loading Permissions...'
			};
			try {
				permissionSet = {
					state: 'success',
					data: await loadPermissions()
				};
				try {
					rolePermissionSet = {
						state: 'success',
						data: await loadRolePerms(role.id)
					};
				} catch (err) {
					rolePermissionSet = {
						state: 'failed',
						message: 'Failed to load Role Permissions'
					};
				}
			} catch (err: any) {
				permissionSet = {
					state: 'failed',
					message: 'Failed to load Permissions'
				};
			} finally {
				if (permissionSet.state !== 'success') {
					permissionWithScope = {};
				} else if (rolePermissionSet.state !== 'success') {
					permissionWithScope = {};
				} else
					permissionWithScope = permissionSet.data.reduce(
						(acc, item) => {
							let s = false;
							const [scope, action] = item.code.split(':', 2);
							if (!acc[scope]) acc[scope] = [];
							if (
								rolePermissionSet.state === 'success' &&
								rolePermissionSet.data.find((perm) => perm.id === item.id)
							) {
								s = true;
							} else {
								s = false;
							}
							acc[scope].push({
								id: item.id,
								title: action,
								description: item.description,
								status: s
							});
							return acc;
						},
						<Record<string, PermissionChildType[]>>{}
					);
			}
		})();
	});
</script>

<SideSheet {errorText} title="Edit Role" description={org.name} bind:sheetOpen={open}>
	<form onsubmit={handleSubmit} class="flex h-full flex-col gap-sm">
		<div class="grid gap-3">
			<Label for="name" class="text-end">Name</Label>
			<Input autofocus={false} value={role.name} class="primary-input" name="name" />
		</div>
		<div class="grid gap-3">
			<Label for="name" class="text-end">Permissions</Label>
			<div class="rounded border border-muted-foreground bg-muted">
				{#if permissionSet.state === 'pending'}
					<p class="p-xs">{permissionSet.message}</p>
				{:else if rolePermissionSet.state === 'pending'}
					<p class="p-xs">{rolePermissionSet.message}</p>
				{:else if permissionSet.state === 'success' && rolePermissionSet.state === 'success'}
					{#each Object.keys(permissionWithScope) as scope}
						<div class="flex flex-col border-b border-muted-foreground p-xs last:border-0">
							<div class="flex items-center gap-x-xxs font-medium">
								<Checkbox
									onCheckedChange={(value) => {
										if (saveDisabled) saveDisabled = false;
										permissionWithScope[scope].forEach((item) => (item.status = value));
									}}
									indeterminate={isScopeIndeterminate(scope)}
									checked={isScopeChecked(scope)}
									class="border-muted-foreground"
								/>
								<p>{scope}</p>
							</div>
							<div class="mt-2 ml-6">
								{#each permissionWithScope[scope] as childPerm}
									<div class="flex flex-col">
										<div class="flex items-center gap-x-xxs">
											<Checkbox
												onCheckedChange={(value) => {
													if (saveDisabled) saveDisabled = false;
												}}
												bind:checked={childPerm.status}
												class="border-muted-foreground"
											/>
											<p>{childPerm.title}</p>
										</div>
										<p class="ml-6 text-muted-foreground">{childPerm.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				{:else if permissionSet.state === 'failed'}
					<p class="p-xs">{permissionSet.message}</p>
				{:else if rolePermissionSet.state === 'failed'}
					<p class="p-xs">{rolePermissionSet.message}</p>
				{:else}
					<p class="p-xs">Something went wrong</p>
				{/if}
			</div>
		</div>
		<Sheet.Footer class="sticky bottom-0 z-30 bg-background px-0 py-xs">
			<Button disabled={saveDisabled} type="submit">Save changes</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
