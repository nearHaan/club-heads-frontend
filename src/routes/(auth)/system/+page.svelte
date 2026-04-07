<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { ChevronLeftIcon } from '@lucide/svelte';
	import OrganizationTypesSection from './organization-types-section.svelte';
</script>

<div class="relative flex">
	<div class="flex w-full lg:pl-30">
		<OrganizationTypesSection />
	</div>
	<div class="sticky top-0 right-0 flex w-50 max-sm:hidden">
		<Separator class="my-r-pad" orientation="vertical" />
		<div class="my-r-pad flex flex-col items-start">
			<Button variant="link"><ChevronLeftIcon /> Organizations</Button>
			<Button variant="link"><ChevronLeftIcon /> Venues</Button>
		</div>
	</div>
</div>

<!-- <div class="flex flex-col gap-y-sm p-r-pad">
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
							<div class="borer-b flex items-center border p-xs">
								<p class="flex-1">
									{orgTypes.data.find((item) => item.id === child.childTypeId)?.name}
								</p>
								<Button variant="link" class=" text-red-400"><TrashIcon /></Button>
							</div>
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
	<Separator />
	<div class="flex grid-cols-2 flex-col gap-xs lg:grid"></div>
</div> -->
