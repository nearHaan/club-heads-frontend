<script lang="ts">
	import { addEventCategory, loadEventCategories } from '$lib/api/event-categories';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { EventCategory, LoadedData } from '$lib/types';
	import { PlusIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let categories = $state<LoadedData<EventCategory[]>>({
		state: 'pending',
		message: 'Loading Event Categories...'
	});
	let newCategoryValue: string = $state('');

	async function onSave() {
		if (!newCategoryValue) return;
		const saveToastId = toast.loading('Saving new event category...');
		try {
			const newCateory = await addEventCategory(newCategoryValue);
			if (categories.state === 'success') {
				categories.data = [
					...categories.data,
					{
						id: newCateory.id,
						name: newCategoryValue
					}
				];
			}
			toast.success('Event Category Saved', { id: saveToastId });
		} catch (err) {
			console.error(err);
			toast.error('Failed to save event category', { id: saveToastId });
		} finally {
			newCategoryValue = '';
		}
	}

	onMount(async () => {
		try {
			categories = {
				state: 'success',
				data: await loadEventCategories()
			};
		} catch (error) {
			categories = {
				state: 'failed',
				message: 'Failed to load event categories'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<div>
		<h3>Event Categories</h3>
		<p class="text-sm text-muted-foreground">Manage Event Categories.</p>
	</div>
	<div class="">
		{#if categories.state === 'pending'}
			<div class="flex animate-pulse flex-col gap-0.5 rounded-sm">
				<div class="h-9 w-full rounded-t-sm bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full rounded-b-sm bg-muted"></div>
			</div>
		{:else if categories.state === 'success'}
			{#each categories.data as category}
				<div
					class={[
						'flex w-full justify-start border-x border-b border-foreground px-sm py-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b'
					]}
				>
					{category.name}
				</div>
			{/each}
			<div
				class="flex w-full border-x border-b border-foreground p-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b max-sm:flex-col"
			>
				<input
					bind:value={newCategoryValue}
					onchange={(e) => {
						newCategoryValue = e.currentTarget.value;
					}}
					name="eventCategory"
					placeholder="New Category"
					class="w-full rounded bg-muted p-xs"
					type="text"
				/>
				<Button onclick={onSave} variant="link"><PlusIcon /> Add</Button>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {categories.message}</p>
		{/if}
	</div>
</div>
