<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
	import type { ClassValue } from 'tailwind-variants';
	import { CalendarIcon } from '@lucide/svelte';

	let {
		value = $bindable(),
		class: className
	}: { value: CalendarDate | undefined; class?: ClassValue } = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class={[
					'w-full justify-between rounded-none border-x border-t-0 border-b text-sm font-normal shadow-none first:rounded-t-sm first:border-t last:rounded-b-sm sm:w-48',
					className
				]}
			>
				{value ? value.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
				<CalendarIcon />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto overflow-hidden p-0" align="start">
		<Calendar
			type="single"
			bind:value
			captionLayout="dropdown"
			onValueChange={() => {
				open = false;
			}}
		/>
	</Popover.Content>
</Popover.Root>
