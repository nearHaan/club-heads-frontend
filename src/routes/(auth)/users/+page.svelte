<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
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
	import type { User } from '$lib/types';

	export const data: User[] = [
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		},
		{
			id: '123',
			name: 'Farhaan',
			role: ['Club Head', 'Faculty Coordinator'],
			email: 'farhaan@gmail.com',
			status: 'active'
		}
	];

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
	let statusValue = $state(status[0]?.label ?? 'Active');
	let selectedRoles: Array<string> = $state(['123']);

	const orgTriggerContent = $derived(
		organizations.find((o) => o.value === orgValue)?.label ?? 'Select an Organization'
	);
	const roleTriggerContent = $derived(
		roleFilters.find((r) => r.value === roleValue)?.label ?? 'All users'
	);
	const statusTriggerContent = $derived(
		status.find((s) => s.value === statusValue)?.label ?? 'Active'
	);
</script>

<Sheet.Root>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<div class="overflow-auto">
			<Sheet.Header>
				<Sheet.Title>Add User</Sheet.Title>
				<Sheet.Description>
					Enter the details of the new user. Click save when you're done.
				</Sheet.Description>
			</Sheet.Header>
			<div class="grid flex-1 auto-rows-min gap-6 px-4">
				<div class="grid gap-3">
					<Label for="name" class="text-end">Name</Label>
					<Input id="name" />
				</div>
				<div class="grid gap-3">
					<Label for="email" class="text-end">Email</Label>
					<Input id="email" />
				</div>
				<div class="grid gap-3">
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
				</div>
				<div class="grid gap-3">
					<Label for="status" class="text-end">Status</Label>
					<SelectButton
						name={'status'}
						label={'Status'}
						bind:value={statusValue}
						trigContent={statusTriggerContent}
						items={status}
						size="full"
					/>
				</div>
			</div>
		</div>
		<Sheet.Footer>
			<Button type="submit">Save changes</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
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
			<Sheet.Trigger class={buttonVariants({ variant: 'default' })}>
				Add User <PlusIcon />
			</Sheet.Trigger>
		</div>
		<div class="p-xxs">
			<DataTable {data} {columns} />
		</div>
	</div>
</Sheet.Root>
