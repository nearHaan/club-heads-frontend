<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { EventDetail } from '$lib/types';
	import { Ellipsis } from '@lucide/svelte';

	let { event }: { event: EventDetail } = $props();

	let descLength = $state(150);

	function onMoreClick() {
		descLength += 100;
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex w-full flex-col">
		<p class="leading-tight text-muted-foreground">
			{event.requestDetails.slice(0, descLength).trim()}
			{#if event.requestDetails.length > descLength}
				<span>
					<Button onclick={onMoreClick} variant="link" class="h-min p-0 text-xs">Show more</Button>
				</span>
			{/if}
		</p>
	</div>
	<div class="flex gap-sm max-sm:flex-col">
		<div class="flex w-full flex-col">
			<p class="text-xs text-muted-foreground">Expected participants</p>
			<p class="text-lg leading-tight">{event.expectedParticipants}</p>
		</div>
		<div class="flex w-full items-center justify-between">
			<div class="flex w-full flex-col">
				<p class="text-xs text-muted-foreground">Starts at</p>
				<p class="text-left text-lg leading-tight">
					{formatDateDayAndMonthAndYear(event.startsAt)}
				</p>
				<p class="text-lg leading-tight">{formatDateOnlyTime(event.startsAt)}</p>
			</div>
			<Ellipsis />
			<div class="flex w-full flex-col items-end">
				<p class="text-xs text-muted-foreground">Ends at</p>
				<p class="text-right text-lg leading-tight">{formatDateDayAndMonthAndYear(event.endsAt)}</p>
				<p class="text-lg leading-tight">{formatDateOnlyTime(event.endsAt)}</p>
			</div>
		</div>
	</div>
</div>
