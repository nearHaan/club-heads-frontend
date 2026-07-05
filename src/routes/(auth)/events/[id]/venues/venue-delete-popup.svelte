<script lang="ts">
	import { deleteEventVenue } from '$lib/api/events/venue-allotments';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { type EventVenueAllotment, type LoadedData, type Venue } from '$lib/types';
	import { Loader, SquareArrowRightExit, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		eventId,
		venue,
		allotedVenues = $bindable()
	}: {
		isOpen: boolean;
		eventId: number;
		venue: EventVenueAllotment;
		allotedVenues: EventVenueAllotment[];
	} = $props();

	let errorText = $state('');
	let loading = $state(false);

	async function deleteVenue() {
		errorText = '';
		try {
			loading = true;
			await deleteEventVenue(eventId, venue.id);
			allotedVenues = [...allotedVenues.filter((v) => v.id !== venue.id)];
			isOpen = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="flex flex-col gap-2.5 overflow-hidden rounded-lg p-3 sm:max-w-lg">
		<p class="mt-1 text-sm text-muted-foreground">Delete Venue</p>
		<div class="flex min-w-60 flex-col gap-2.5 py-2">
			<p class="text-sm leading-5">
				Delete <i>{venue.venue.name}</i> alloted to this event
			</p>
			{#if errorText}
				<p class="text-xs text-red-500">{errorText}</p>
			{/if}
		</div>
		<div class="flex w-full gap-2.5 text-sm sm:flex-row">
			<Button
				onclick={() => {
					isOpen = false;
				}}
				size="sm"
				variant="outline"
				class={['flex-1', 'bg-background text-foreground']}
			>
				<SquareArrowRightExit />Go Back
			</Button>
			<Button
				disabled={loading}
				size="sm"
				variant="destructive"
				class="flex-1"
				onclick={deleteVenue}
			>
				{#if loading}<Loader class="animate-spin" />
				{:else}
					<X />
				{/if}
				Delete
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
