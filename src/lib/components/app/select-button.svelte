<script lang="ts">
	import * as Select from '../ui/select/index.js';

	let {
		name,
		label,
		value = $bindable(),
		trigContent,
		items,
		size = 'fit'
	}: {
		name: string;
		label: string;
		value: string;
		trigContent: string;
		items: { value: string; label: string }[];
		size: 'full' | 'fit';
	} = $props();
</script>

<Select.Root type="single" {name} bind:value>
	<Select.Trigger class={`${size === 'full' ? 'w-full' : ''}`}>
		{trigContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#if items.length > 0}
				{#each items as v (v.value)}
					<Select.Item value={v.value} label={v.label}>
						{v.label}
					</Select.Item>
				{/each}
			{:else}
				<p class="p-xxs text-xs italic">No items</p>
			{/if}
		</Select.Group>
	</Select.Content>
</Select.Root>
