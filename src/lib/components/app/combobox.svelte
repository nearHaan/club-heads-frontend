<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	let {
		placeholder,
		emptyMsg,
		listItems
	}: { placeholder: string; emptyMsg: string; listItems: { value: string; label: string }[] } =
		$props();

	let open = $state(false);
	let value = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(listItems.find((f) => f.value === value)?.label);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger class="w-full" bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class="flex justify-start"
				{...props}
				role="combobox"
				aria-expanded={open}
			>
				{selectedValue || placeholder}
				<ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0">
		<Command.Root>
			<Command.Input {placeholder} />
			<Command.List>
				<Command.Empty>{emptyMsg}</Command.Empty>
				<Command.Group>
					{#each listItems as item}
						<Command.Item
							value={item.value}
							onSelect={() => {
								value = item.value;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn('me-2 size-4', value !== item.value && 'text-transparent')} />
							{item.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
