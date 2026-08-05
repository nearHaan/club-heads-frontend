<script lang="ts" generics="T extends {id: number, name?: string}">
	import type { LoadedData } from '$lib/types';
	import { cn } from 'tailwind-variants';
	let {
		name,
		class: className,
		value = $bindable(null),
		loadFn,
		...restProps
	}: {
		name: string;
		class?: string;
		value: T | null;
		loadFn: () => Promise<T[]>;
	} = $props();

	let itemsList = $state<LoadedData<T[]>>({
		state: 'pending',
		message: 'Loading...'
	});

	async function loadItems() {
		if (itemsList.state === 'success') return;
		try {
			itemsList = {
				state: 'success',
				data: await loadFn()
			};
		} catch (err: any) {
			itemsList = {
				state: 'failed',
				message: err.message ?? 'Failed to load'
			};
		}
	}
</script>

<select {name} bind:value onclick={loadItems} {...restProps} class={cn('select-button', className)}>
	{#if itemsList.state === 'success'}
		{#if itemsList.data.length === 0}
			<option disabled={true}>Empty</option>
		{/if}
		{#each itemsList.data as item}
			<option value={item}>{item.name}</option>
		{/each}
	{:else}
		<option disabled={true}>Loading...</option>
	{/if}
</select>
