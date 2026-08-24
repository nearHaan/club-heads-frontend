<script lang="ts">
	import { assignFacilityToEvent, unassignFacilityFromEvent } from '$lib/api/events';
	import { getVenueById, getVenueByIdInDetail } from '$lib/api/venue';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { type LoadedData, type VenueDetail } from '$lib/types';
	import { Delete, Plus, Search, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		allotmentIndex,
		facilityIndex,
		event,
		allotedVenues = $bindable([])
	}: {
		open?: boolean;
		event: {
			id: number;
		};
		allotmentIndex: number;
		facilityIndex: number;
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

	let facilities = $state<LoadedData<VenueDetail['facilities']>>({
		state: 'pending',
		message: 'Loading facilities...'
	});

	let allotment = $derived(allotedVenues[allotmentIndex]);
	let facility = $derived(allotedVenues[allotmentIndex]?.facilities?.[facilityIndex]);

	$effect(() => {
		if (open) {
			(async () => {
				try {
					const venue = await getVenueByIdInDetail(allotment.venue.id);
					facilities = {
						state: 'success',
						data: venue.facilities
					};
				} catch (error: any) {
					facilities = {
						state: 'failed',
						message: error.message ?? 'Something went wrong'
					};
				}
			})();
		}
	});

	let removingFacility = $state(false);
</script>

{#if facility != null}
	<Dialog.Root bind:open>
		<Dialog.Trigger
			class="flex place-items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
		>
			{facility.facility.name}
			<X class="inline size-4" />
		</Dialog.Trigger>
		<Dialog.Content class="flex max-h-[80vh] flex-col p-3">
			<Dialog.Header>
				<Dialog.Title>Unassign facility from venue?</Dialog.Title>
				<!-- <Dialog.Description>Are you sure you want to remove?</Dialog.Description> -->
			</Dialog.Header>

			<div class="my-4 flex min-h-0 flex-col space-y-2">
				<div class="overflow-y-scroll rounded-sm border p-2">
					Are you sure you want to remove <b>{facility.facility.name}</b> from the allotment of
					<b>{allotment.venue.name}</b>?
				</div>
			</div>

			<Dialog.Footer>
				<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
				<Button
					variant="destructive"
					disabled={removingFacility}
					onclick={async () => {
						if (removingFacility) return;
						removingFacility = true;

						try {
							await unassignFacilityFromEvent(event.id, facility.id);
							allotedVenues[allotmentIndex].facilities = allotedVenues[
								allotmentIndex
							].facilities.filter((fa) => fa.id !== facility.id);
							open = false;
						} catch (err: any) {
							toast.error(err.message ?? 'Failed to unassign facility from event');
						} finally {
							removingFacility = false;
						}
					}}>Yes, remove</Button
				>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
