<script lang="ts">
	import { deleteEventVenue } from '$lib/api/events/venue-allotments';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { type EventVenueAllotment, type LoadedData, type Venue } from '$lib/types';
	import { Loader } from '@lucide/svelte';

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
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-xl">
			<p class="/bg-muted border-b px-3 py-4 text-sm">Delete Venue</p>
			<div class="flex min-w-60 flex-col gap-2.5 p-3">
				<p class="text-sm leading-5">
					Delete <i>{venue.venue.name}</i> alloted to this event
				</p>
				{#if errorText}
					<p class="text-xs text-red-500">{errorText}</p>
				{/if}
				<div class="flex w-full justify-end gap-2.5 text-sm">
					<button
						type="button"
						onclick={() => {
							isOpen = false;
						}}
						class="px-2 py-2 text-muted-foreground">Go Back</button
					>
					<button
						type="button"
						onclick={deleteVenue}
						disabled={loading}
						class="flex items-center px-2 py-2 font-bold text-foreground"
						>{#if loading}<Loader size="15" class="animate-spin" />
						{/if} Confirm</button
					>
				</div>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
