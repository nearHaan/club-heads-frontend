<script lang="ts">
	import { addChildOrgType, addOrgType, loadOrgTypes } from '$lib/api/organizations';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { LoadedData, OrganizationType } from '$lib/types';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let orgTypes = $state<LoadedData<OrganizationType[]>>({
		state: 'pending',
		message: 'Loading Organizations'
	});
	let newOrgTypeValue: string = $state('');

	async function onSave() {
		if (!newOrgTypeValue) return;
		const promise = addOrgType(newOrgTypeValue);
		toast.promise(promise, {
			loading: 'Saving new organization type...',
			success: (newType) => {
				console.log('Added new type');
				if (orgTypes.state === 'success') {
					orgTypes.data = [...orgTypes.data, newType.data];
				}
				return 'Organization Type Saved';
			},
			error: (err) => {
				console.error(err);
				return 'Failed to save type';
			},
			finally: () => {
				newOrgTypeValue = '';
			}
		});
	}

	async function onChildAdd(parentId: string, childId: string) {
		if (!parentId || !childId) return;
		const promise = addChildOrgType(parentId, childId);
		toast.promise(promise, {
			loading: 'Adding Child type...',
			success: (res) => {
				console.log('Added child');
				if (orgTypes.state === 'success') {
					orgTypes.data = orgTypes.data.map((orgType) =>
						orgType.id === parentId
							? {
									...orgType,
									selectedId: '',
									children: [...orgType.children, { childTypeId: childId }]
								}
							: orgType
					);
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

<div class="flex flex-col gap-y-sm p-r-pad">
	<div class="flex flex-col gap-y-xs">
		<p class="text-sm font-bold">Organization Type</p>
		<Label for="orgName">Name</Label>
		<div class="flex w-full items-start gap-xs max-sm:flex-col">
			<Input
				bind:value={newOrgTypeValue}
				onchange={(e) => {
					newOrgTypeValue = e.currentTarget.value;
				}}
				name="orgName"
				class="max-w-100"
				type="text"
			/>
			<Button onclick={onSave}>Save</Button>
		</div>
	</div>
	<Separator />
	<div class="flex grid-cols-2 flex-col gap-xs lg:grid">
		{#if orgTypes.state === 'pending'}
			<p>Loading</p>
		{:else if orgTypes.state === 'success'}
			{#each orgTypes.data as org}
				{@const selectTrigCont =
					orgTypes.data.find((item) => item.id === org.selectedId)?.name ?? 'Add new child'}
				{@const selectItems = orgTypes.data
					.filter(
						(item) =>
							item.id !== org.id &&
							org.children &&
							org.children.findIndex((child) => child.childTypeId === item.id) === -1
					)
					.map((item) => ({ value: item.id, label: item.name }))}
				<div class="h-fit border">
					<p class="bg-secondary p-xs text-sm font-bold">{org.name}</p>
					<Separator />
					<div>
						{#each org.children as child}
							<p class="borer-b border p-xs">
								{orgTypes.data.find((item) => item.id === child.childTypeId)?.name}
							</p>
						{/each}
						<div class="flex">
							<SelectButton
								name="Organization"
								label="Organization"
								bind:value={org.selectedId}
								trigContent={selectTrigCont}
								items={selectItems}
								size="full"
							/>
							<Button
								onclick={() => {
									onChildAdd(org.id, org.selectedId);
								}}
								class="rounded-none">Add</Button
							>
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<p>Failed to Load: {orgTypes.message}</p>
		{/if}
	</div>
</div>
