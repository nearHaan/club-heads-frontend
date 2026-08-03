<script lang="ts">
	import { addFacility, loadFacilities } from '$lib/api/facilities';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { Facility, LoadedData } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let facilities = $state<LoadedData<Facility[]>>({
		state: 'pending',
		message: 'Loading facilities...'
	});
	let newFacilityValue: string = $state('');

	async function onSave() {
		if (!newFacilityValue) return;
		const saveToastId = toast.loading('Saving new facility...');
		try {
			const newFacility = await addFacility(newFacilityValue);
			if (facilities.state === 'success') {
				facilities.data = [
					...facilities.data,
					{
						id: newFacility.id,
						name: newFacilityValue
					}
				];
			}
			toast.success('Facility Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save facility', { id: saveToastId });
		} finally {
			newFacilityValue = '';
		}
	}

	onMount(async () => {
		try {
			facilities = {
				state: 'success',
				data: await loadFacilities()
			};
		} catch (error) {
			facilities = {
				state: 'failed',
				message: 'Failed to load facilities'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<h3>Facilities</h3>
	<p class="text-sm text-muted-foreground">Manage facilities that can be linked to venues.</p>
	<div class="">
		{#if facilities.state === 'pending'}
			<div class="flex animate-pulse flex-col gap-0.5 rounded-sm">
				<div class="h-9 w-full rounded-t-sm bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full rounded-b-sm bg-muted"></div>
			</div>
		{:else if facilities.state === 'success'}
			{#each facilities.data as org}
				<div
					class={[
						'flex w-full justify-start border-x border-b border-foreground px-sm py-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b',
					]}>{org.name}</div
				>
			{/each}
			<div
				class="flex w-full border-x border-b border-foreground p-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b max-sm:flex-col"
			>
				<input
					bind:value={newFacilityValue}
					onchange={(e) => {
						newFacilityValue = e.currentTarget.value;
					}}
					name="facilityName"
					placeholder="New Facility"
					class="w-full rounded bg-muted p-xs"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {facilities.message}</p>
		{/if}
	</div>
</div>
