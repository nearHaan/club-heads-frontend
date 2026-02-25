<script lang="ts">
	import { loadOrgs } from '$lib/api/organizations';
	import { loadRoles } from '$lib/api/roles';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { roleState } from '$lib/stores/roleAssign.svelte';
	import type { AssignRole, Organization, Role, User } from '$lib/types';
	import {
		ArrowDownIcon,
		ArrowRightIcon,
		DeleteIcon,
		MoveRightIcon,
		TrashIcon
	} from '@lucide/svelte';

	let orgRoleMapList: AssignRole[] = $state([]);

	let orgValue = $state('');
	let roleValue = $state('');
</script>

<Sheet.Root open={roleState.assignSheetOpen}>
	<Sheet.Content class="h-screen w-full sm:min-w-120" side="right">
		<form>
			<Sheet.Header>
				<Sheet.Title>Assign Roles</Sheet.Title>
				<Sheet.Description>Assign roles to each user</Sheet.Description>
			</Sheet.Header>
			<div class="mx-xs flex h-full flex-col overflow-auto">
				<div class="flex flex-col gap-y-xs">
					{#each orgRoleMapList as item, index}
						<div class="flex flex-col rounded bg-secondary p-xs">
							<p class="text-md">Club Head</p>
							<p class="text-sm text-secondary-foreground">Coding Club</p>
						</div>
					{/each}
				</div>
				<div class="sticky bottom-0 z-10 flex flex-col">
					<Separator class="my-xs" />
					<div
						class="flex items-center justify-center rounded-lg bg-secondary p-xs max-sm:flex-col"
					>
						<div class="grid w-full gap-3">
							<!-- <Label for="name" class="text-end">Organization</Label> -->
							<DynamicSelectButton
								name="org"
								initialText="Select an Organization"
								size="full"
								bind:value={orgValue}
								loadFn={loadOrgs}
								mapOption={(item: Organization) => ({ value: item.id, label: item.name })}
								isBg={true}
							/>
						</div>
						<ArrowRightIcon size={30} class="m-xs text-secondary-foreground max-sm:hidden" />
						<ArrowDownIcon size={15} class="m-xs text-secondary-foreground sm:hidden" />
						<div class="grid w-full gap-3">
							<!-- <Label for="role" class="text-end">Role</Label> -->
							<DynamicSelectButton
								name="role"
								initialText="Select a Role"
								size="full"
								bind:value={roleValue}
								loadFn={loadRoles}
								mapOption={(item: Role) => ({ value: item.id, label: item.roleName })}
								isBg={true}
							/>
						</div>
					</div>
					<Button
						onclick={() => {
							if (roleState.selectedUser) {
								const newItem: AssignRole = {
									userId: roleState.selectedUser.id,
									roleId: roleValue,
									organizationId: orgValue
								};
								orgRoleMapList.push(newItem);
							}
						}}
						class="mt-xs"
						variant="default">Add Role</Button
					>
				</div>
			</div>
		</form>
		<Sheet.Footer>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
