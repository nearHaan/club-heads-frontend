<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { EventDetail, EventVenueAllotment, Venue } from '$lib/types';
	import { Bed, Plus, X } from '@lucide/svelte';
	import VenuesDatetimeSelectionPopup from './venues-datetime-selection-popup.svelte';
	import VenuesSelectionPopup from './venues-selection-popup.svelte';
	import VenueDeletePopup from './venue-delete-popup.svelte';
	import VenueFacilityAssignmentPopup from './venue-facility-assignment-popup.svelte';
	import VenueFacilityAssignmentDeletionPopup from './venue-facility-assignment-deletion-popup.svelte';

	let {
		eventId,
		event,
		allotedVenues = $bindable([])
	}: {
		eventId: number;
		event: EventDetail;
		allotedVenues: {
			id: number;
			startsAt: string;
			endsAt: string;
			venue: {
				id: number;
				name: string;
			};
			facilities: {
				id: number;
				venueAllotmentId: number | null;
				facility: {
					id: number;
					name: string;
					type: {
						id: number;
						name: string;
					};
					isAvailable: boolean;
				};
			}[];
		}[];
	} = $props();

	let selectedVenue: Venue | null = $state(null);
	let venueSelectedForDeletetion: EventVenueAllotment | null = $state(null);

	let selectVenuePopupOpen = $state(false);
	let selectDateTimePopupOpen = $state(false);
	let deleteVenuePopupOpen = $state(false);
	let facilityAssignmentPopupOpen = $state(false);
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
			{#each allotedVenues as allotment, i}
				<div class="px-3 pt-1 pb-2 first:rounded-t-lg last:rounded-b-lg">
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

					<div
						class="mt-1 flex place-items-center justify-between gap-4 text-xs text-muted-foreground"
					>
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

					<div class="mt-3 flex gap-1">
						{#each allotment.facilities as facility, j}
							<!-- <button
								class="flex place-items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-xs text-secondary-foreground"
							>
								{facility.facility.name}
								<X class="inline size-4" /> -->

							<VenueFacilityAssignmentDeletionPopup
								bind:allotedVenues
								allotmentIndex={i}
								{event}
								facilityIndex={j}
							/>
							<!-- </button> -->
						{/each}

						{#if event.status === 'draft'}
							<VenueFacilityAssignmentPopup bind:allotedVenues allotmentIndex={i} {event} />

							<!-- <button
								class="flex place-items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
							>
								<Plus class="inline size-4" /> Add facility
							</button> -->
						{/if}
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
	{event}
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
<!--
{#if event.status === 'draft'}
	<VenueFacilityAssignmentPopup bind:open={facilityAssignmentPopupOpen} />
{/if} -->
