<script lang="ts">
	import type { ClassValue } from 'tailwind-variants';
	import Input from '../ui/input/input.svelte';
	import { buttonVariants } from '../ui/button';
	import { Clock } from '@lucide/svelte';

	let { value = $bindable(), class: className }: { value: string; class?: ClassValue } = $props();
</script>

<div
	class={buttonVariants({
		variant: 'outline',
		class: [
			'w-full justify-between rounded-none border-x border-t-0 border-b text-sm font-normal shadow-none first:rounded-t-sm first:border-t last:rounded-b-sm sm:w-48',
			className
		]
	})}
>
	<Input
		type="time"
		step="1"
		bind:value
		class={[
			'appearance-none border-none bg-transparent p-0 text-sm shadow-none focus:outline-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
		]}
	/>
	<Clock />
</div>
