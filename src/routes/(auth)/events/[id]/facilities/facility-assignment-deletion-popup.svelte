<script lang="ts">
	import { assignFacilityToEvent, unassignFacilityFromEvent } from '$lib/api/events';
	import { getEventAssociatedFacilities } from '$lib/api/facilities';
	import { getVenueById, getVenueByIdInDetail } from '$lib/api/venue';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { type EventDetail, type LoadedData, type VenueDetail } from '$lib/types';
	import { Delete, Plus, Search, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		event = $bindable(),
		facilityIndex
	}: {
		open?: boolean;
		event: EventDetail;
		facilityIndex: number;
	} = $props();

	let facilities = $state<
		LoadedData<
			{
				id: number;
				name: string;
				type: {
					id: number;
					name: string;
				};
				association: 'event' | 'venue_allotment';
				overlapPolicy: 'shared' | 'exclusive';
				workflowParticipationPolicy: 'include' | 'exclude';
				isAvailable: boolean;
				providers: {
					id: number;
					scope: {
						type: 'organization' | 'venue';
						id: number;
						name: string;
						kind: {
							id: number;
							name: string;
						};
					};
				}[];
			}[]
		>
	>({
		state: 'pending',
		message: 'Loading facilities...'
	});

	let facilityAssignment = $derived(event.facilities[facilityIndex]);

	$effect(() => {
		if (open) {
			(async () => {
				try {
					const data = await getEventAssociatedFacilities();
					facilities = {
						state: 'success',
						data: data
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

{#if facilityAssignment != null}
	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
			<X class="inline size-4" />
		</Dialog.Trigger>
		<Dialog.Content class="flex max-h-[80vh] flex-col p-3">
			<Dialog.Header>
				<Dialog.Title>Unassign facility from event?</Dialog.Title>
				<!-- <Dialog.Description>Are you sure you want to remove?</Dialog.Description> -->
			</Dialog.Header>

			<div class="my-4 flex min-h-0 flex-col space-y-2">
				<div class="overflow-y-scroll rounded-sm border p-2">
					Are you sure you want to remove <b>{facilityAssignment.facility.name}</b> from the event
					<b>{event.title}</b>?
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
							await unassignFacilityFromEvent(event.id, facilityAssignment.id);
							event.facilities = event.facilities.filter((fa) => fa.id !== facilityAssignment.id);
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
