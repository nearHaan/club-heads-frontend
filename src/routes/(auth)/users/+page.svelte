<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { PlusIcon } from '@lucide/svelte';
	import { columns } from './column';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import type { LoadedData, User } from '$lib/types';
	import { loadUsers } from '$lib/api/users.js';
	import { onMount } from 'svelte';
	import AssignRole from './assign-role.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import AddUser from './add-user.svelte';

	let users = $state<LoadedData<User[]>>({
		state: 'pending',
		message: 'Loading users...'
	});

	const organizations = [
		{ value: 'CS Dept', label: 'CS Dept' },
		{ value: 'EC Dept', label: 'EC Dept' },
		{ value: 'EEE Dept', label: 'EEE Dept' }
	];
	const roleFilters = [
		{ value: 'All Users', label: 'All Users' },
		{ value: 'Club Heads', label: 'Club Heads' },
		{ value: 'Faculty Coordinator', label: 'Faculty Coordinator' }
	];
	const status = [
		{ value: 'Active', label: 'Active' },
		{ value: 'Inactive', label: 'Inactive' }
	];
	const roles = [
		{
			id: '123',
			name: 'Club Head',
			desc: 'Manage and view events, view and request venue allocation'
		},
		{
			id: '124',
			name: 'Faculty Coordinator',
			desc: 'Manage and view events, view and request venue allocation'
		}
	];

	let orgValue = $state('');
	let roleValue = $state(roleFilters[0]?.label ?? 'All Users');
	let selectedRoles: Array<string> = $state(['123']);

	let sheetOpen = $state(false);

	const orgTriggerContent = $derived(
		organizations.find((o) => o.value === orgValue)?.label ?? 'Select an Organization'
	);
	const roleTriggerContent = $derived(
		roleFilters.find((r) => r.value === roleValue)?.label ?? 'All users'
	);

	let errorText = $state('');

	onMount(async () => {
		try {
			users = {
				state: 'success',
				data: await loadUsers()
			};
			console.log(users.data);
		} catch (error) {
			users = {
				state: 'failed',
				message: 'Failed to load users'
			};
		}
	});
</script>

<div class="flex w-full flex-col">
	<div class="border-muted-background flex w-full justify-between border-b p-xxs">
		<SelectButton
			name={'roleFilter'}
			label={'Filter by role'}
			bind:value={roleValue}
			trigContent={roleTriggerContent}
			items={roleFilters}
			size="fit"
		/>
		<Button
			onclick={() => {
				sheetOpen = true;
			}}>Add User <PlusIcon /></Button
		>
	</div>
	<div class="p-xxs">
		{#if users.state === 'pending'}
			<p>Loading users</p>
		{:else if users.state === 'success'}
			<DataTable data={users.data} {columns} />
		{:else}
			<p>Failed to load users</p>
		{/if}
	</div>
</div>

<AddUser bind:open={sheetOpen} />
<AssignRole />

<!-- <div class="grid gap-3">
						<Label for="org" class="text-end">Organization</Label>
						<SelectButton
							name={'org'}
							label={'Organizations'}
							bind:value={orgValue}
							trigContent={orgTriggerContent}
							items={organizations}
							size="full"
						/>
					</div>
					<div class="grid gap-3">
						<Label for="roles" class="text-end">Role(s)</Label>
						{#each selectedRoles as selRole (selRole)}
							<Label
								class="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950"
							>
								<Checkbox
									id="toggle-2"
									checked
									class="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
									onCheckedChange={(value) => {
										if (!value) {
											selectedRoles = selectedRoles.filter((id) => id !== selRole);
										}
									}}
								/>
								<div class="grid gap-1.5 font-normal">
									<p class="text-sm leading-none font-medium">
										{roles.find((r) => r.id === selRole)?.name}
									</p>
									<p class="text-sm text-muted-foreground">
										{roles.find((r) => r.id === selRole)?.desc}
									</p>
								</div>
							</Label>
						{/each}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class={buttonVariants({ variant: 'secondary' })}
								>Add Role</DropdownMenu.Trigger
							>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									<ScrollArea class="h-min max-h-60 w-70">
										{#each roles as role (role.id)}
											{#if !selectedRoles.includes(role.id)}
												<DropdownMenu.Item>
													<Label
														class="flex items-start gap-3 rounded-md border p-3 hover:bg-accent/50 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950"
													>
														<Checkbox
															id="toggle-2"
															class="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
															onCheckedChange={(value) => {
																if (value) {
																	selectedRoles = [...selectedRoles, role.id];
																}
															}}
														/>
														<div class="grid gap-1.5 font-normal">
															<p class="text-sm leading-none font-medium">
																{role.name}
															</p>
															<p class="text-sm text-muted-foreground">
																{role.desc}
															</p>
														</div>
													</Label>
												</DropdownMenu.Item>
											{/if}
										{/each}
									</ScrollArea>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div> -->
