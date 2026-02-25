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
	import type { LoadedData, Organization } from '$lib/types';
	import { createUser } from '$lib/api/users.js';
	import { onMount } from 'svelte';
	import { createOrg, loadOrgs } from '$lib/api/organizations';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';

	const typeFilters = [
		{ value: 'All Types', label: 'All Types' },
		{ value: 'Department', label: 'Department' },
		{ value: 'Club', label: 'Club' }
	];
	const types = [
		{ value: 'club', label: 'Club' },
		{ value: 'department', label: 'Department' },
		{ value: 'institution', label: 'Institution' }
	];
	const status = [
		{ value: 'Active', label: 'Active' },
		{ value: 'Inactive', label: 'Inactive' }
	];

	let orgValue = $state('');
	let typeFilterValue = $state(typeFilters[0]?.label ?? 'All Types');
	let typeValue = $state('');
	let statusValue = $state(status[0]?.label ?? 'Active');

	let sheetOpen = $state(false);

	const orgTriggerContent = $derived.by(() => {
		if (selectOrgs.state === 'success') {
			return selectOrgs.data.find((o) => o.value === orgValue)?.label ?? 'Select an Organization';
		} else {
			return 'Select an Organization';
		}
	});
	const typeTriggerContent = $derived(
		types.find((t) => t.value === typeValue)?.label ?? 'Select organization type'
	);
	const typeFilterTriggerContent = $derived(
		typeFilters.find((t) => t.value === typeFilterValue)?.label ?? 'All types'
	);
	// const statusTriggerContent = $derived(
	// 	status.find((s) => s.value === statusValue)?.label ?? 'Active'
	// );

	let errorText = $state('');
	let fetchedOrgs = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations'
	});
	let selectOrgs = $state<LoadedData<{ value: string; label: string }[]>>({
		state: 'pending',
		message: 'Loading organizations'
	});

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name') as string;
			const type = formData.get('type') as Organization['type'];
			const parentOrg = formData.get('org') as string;

			if (await createOrg(name, type, parentOrg)) {
				console.log('Organization Created');
				sheetOpen = false;
			}
		} catch (err: any) {
			errorText = err.message;
		}
	}

	onMount(async () => {
		try {
			fetchedOrgs = {
				state: 'success',
				data: await loadOrgs()
			};
			console.log(fetchedOrgs.data);
		} catch (error) {
			fetchedOrgs = {
				state: 'failed',
				message: 'Failed to load organizations'
			};
		}
	});

	let orgLoading = $state(true);
	const reloadOrgs = async () => {
		try {
			selectOrgs = {
				state: 'success',
				data: (await loadOrgs()).map((o) => ({ value: o.id, label: o.name }))
			};
		} catch (error) {
			selectOrgs = {
				state: 'failed',
				message: 'Loading failed'
			};
		} finally {
			orgLoading = false;
		}
	};
</script>

<Sheet.Root open={true}>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto">
				<Sheet.Header>
					<Sheet.Title>Add Organization</Sheet.Title>
					<Sheet.Description>
						Enter the details of the new organization. Click save when you're done.
					</Sheet.Description>
				</Sheet.Header>
				<div class="grid flex-1 auto-rows-min gap-6 px-4">
					{#if errorText}
						<p class="text-sm text-red-500">{errorText}</p>
					{/if}
					<div class="grid gap-3">
						<Label for="name" class="text-end">Name</Label>
						<Input name="name" />
					</div>
					<div class="grid gap-3">
						<Label for="email" class="text-end">Type</Label>
						<SelectButton
							name={'type'}
							label={'Type'}
							bind:value={typeValue}
							trigContent={typeTriggerContent}
							items={types}
							size="full"
						/>
					</div>
					<div class="grid gap-3">
						<Label for="org" class="text-end">Organization</Label>
						<DynamicSelectButton
							name="organization"
							initialText="Select an Organization"
							size="full"
							value={orgValue ?? ''}
							loadFn={loadOrgs}
							mapOption={(item: Organization) => ({ value: item.id, label: item.name })}
						/>
					</div>
					<!-- <div class="grid gap-3">
						<Label for="status" class="text-end">Status</Label>
						<SelectButton
							name={'status'}
							label={'Status'}
							bind:value={statusValue}
							trigContent={statusTriggerContent}
							items={status}
							size="full"
						/>
					</div> -->
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit">Save changes</Button>
				<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
	<div class="flex w-full flex-col">
		<div class="border-muted-background flex w-full justify-between border-b p-xxs">
			<SelectButton
				name={'roleFilter'}
				label={'Filter by role'}
				bind:value={typeFilterValue}
				trigContent={typeFilterTriggerContent}
				items={typeFilters}
				size="fit"
			/>
			<Sheet.Trigger class={buttonVariants({ variant: 'default' })}>
				Add Organization <PlusIcon />
			</Sheet.Trigger>
		</div>
		<div class="p-xxs">
			{#if fetchedOrgs.state === 'pending'}
				<p>Loading organizations</p>
			{:else if fetchedOrgs.state === 'success'}
				<DataTable data={fetchedOrgs.data} {columns} />
			{:else}
				<p>Failed to load organizations</p>
			{/if}
		</div>
	</div>
</Sheet.Root>

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
