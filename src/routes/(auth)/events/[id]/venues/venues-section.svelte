<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { EventVenueAllotment, Venue } from '$lib/types';
	import { Plus, X } from '@lucide/svelte';
	import VenuesDatetimeSelectionPopup from './venues-datetime-selection-popup.svelte';
	import VenuesSelectionPopup from './venues-selection-popup.svelte';
	import VenueDeletePopup from './venue-delete-popup.svelte';

	let {
		eventId,
		allotedVenues = $bindable([])
	}: {
		eventId: number;
		allotedVenues: EventVenueAllotment[];
	} = $props();

	let selectedVenue: Venue | null = $state(null);
	let venueSelectedForDeletetion: EventVenueAllotment | null = $state(null);

	let selectVenuePopupOpen = $state(false);
	let selectDateTimePopupOpen = $state(false);
	let deleteVenuePopupOpen = $state(false);
</script>

<div class="space-y-2">
	<div class="flex place-items-center justify-between">
		<p class="text-lg font-medium">Venues</p>

		<div class="flex place-items-center gap-2">
			<Button
				variant="ghost"
				size="icon-sm"
				class="has-[>svg]:p-0 sm:w-min"
				onclick={() => (selectVenuePopupOpen = true)}
			>
				<Plus />
			</Button>
		</div>
	</div>

	{#if allotedVenues.length === 0}
		<div class="rounded-lg border p-4 text-center text-muted-foreground">
			<p class="text-xs italic">No venues have been alloted yet</p>
		</div>
	{:else}
		<div class="divide-y rounded-lg border">
			{#each allotedVenues as allotment}
				<div class="space-y-1 px-3 pt-1 pb-2 first:rounded-t-lg last:rounded-b-lg">
					<div class="flex place-items-center justify-between gap-4">
						<div>{allotment.venue.name}</div>

						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => {
								venueSelectedForDeletetion = allotment;
								deleteVenuePopupOpen = true;
							}}
						>
							<X />
						</Button>
					</div>

					<div class="flex place-items-center justify-between gap-4 text-xs text-muted-foreground">
						<div>
							<div>{formatDateDayAndMonthAndYear(allotment.startsAt)}</div>
							<div>{formatDateOnlyTime(allotment.startsAt)}</div>
						</div>
						<div>&hellip;</div>
						<div class="text-right">
							<div>{formatDateDayAndMonthAndYear(allotment.endsAt)}</div>
							<div>{formatDateOnlyTime(allotment.endsAt)}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<VenuesSelectionPopup
	{allotedVenues}
	bind:isDateTimePopupOpen={selectDateTimePopupOpen}
	bind:isOpen={selectVenuePopupOpen}
	bind:selectedVenue
/>

<VenuesDatetimeSelectionPopup
	{eventId}
	bind:isOpen={selectDateTimePopupOpen}
	bind:selectedVenue
	bind:allotedVenues
/>

<VenueDeletePopup
	bind:isOpen={deleteVenuePopupOpen}
	bind:allotedVenues
	venue={venueSelectedForDeletetion!}
	{eventId}
/>
