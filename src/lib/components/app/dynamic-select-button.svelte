<script lang="ts" generics="T">
	import type { LoadedData } from '$lib/types';
	import * as Select from '../ui/select/index.js';
	import SelectButton from './select-button.svelte';

	let {
		name,
		initialText,
		value = $bindable(''),
		size = 'fit',
		loadFn,
		mapOption,
		isBg = false
	}: {
		name: string;
		initialText: string;
		value: string;
		size: 'full' | 'fit';
		loadFn: () => Promise<T[]>;
		mapOption: (item: T) => { value: string; label: string };
		isBg?: boolean;
	} = $props();

	const ddTriggerContent = $derived.by(() => {
		if (itemsList.state === 'success') {
			return itemsList.data.find((o) => o.value === value)?.label ?? initialText;
		} else {
			return initialText;
		}
	});

	let itemsList = $state<LoadedData<{ value: string; label: string }[]>>({
		state: 'pending',
		message: 'Loading organizations'
	});

	const reloadItems = async () => {
		try {
			const data = await loadFn();

			itemsList = {
				state: 'success',
				data: data.map(mapOption)
			};
		} catch (error) {
			itemsList = {
				state: 'failed',
				message: 'Loading failed'
			};
		}
	};
</script>

<Select.Root type="single" {name} bind:value>
	<Select.Trigger
		onclick={reloadItems}
		class={`${size === 'full' ? 'w-full' : ''} ${isBg ? 'bg-background' : ''}`}
	>
		{ddTriggerContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#if itemsList.state === 'pending'}
				<Select.Label>Loading...</Select.Label>
			{:else if itemsList.state === 'success'}
				{#each itemsList.data as v (v.value)}
					<Select.Item value={v.value} label={v.label}>
						{v.label}
					</Select.Item>
				{/each}
			{/if}
		</Select.Group>
	</Select.Content>
</Select.Root>
