<script lang="ts">
	import { assignFacilityToEvent } from '$lib/api/events';
	import { getVenueById, getVenueByIdInDetail } from '$lib/api/venue';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { type LoadedData, type VenueDetail } from '$lib/types';
	import { Delete, Plus, Search } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		event,
		allotmentIndex,
		allotedVenues = $bindable([])
	}: {
		open?: boolean;
		event: {
			id: number;
		};
		allotmentIndex: number;
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

	let searchText = $state('');
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="flex place-items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
	>
		<Plus class="inline size-4" /> Add facility
	</Dialog.Trigger>
	<Dialog.Content class="flex max-h-[80vh] flex-col p-3">
		<Dialog.Header>
			<Dialog.Title>Assign facility to venue</Dialog.Title>
			<Dialog.Description>{allotment.venue.name}</Dialog.Description>
		</Dialog.Header>

		<div class="my-4 flex min-h-0 flex-col space-y-2">
			<div>
				<div class="flex w-full items-center gap-x-2 rounded-sm border px-2 py-1">
					<Search class="shrink-0" size="16" />
					<input
						bind:value={searchText}
						onchange={(e) => (searchText = e.currentTarget.value)}
						type="text"
						placeholder="Search facilities"
						class="w-full text-foreground placeholder:text-muted-foreground focus:outline-none"
					/>
					{#if searchText && searchText.trim().length > 0}
						<button
							class="cursor-pointer"
							onclick={() => {
								searchText = '';
							}}><Delete size="15" /></button
						>
					{/if}
				</div>
			</div>
			<div class="overflow-y-scroll rounded-sm border">
				{#if facilities.state === 'pending'}
					<p class="px-3 py-1.5 text-center text-sm text-muted-foreground">{facilities.message}</p>
				{:else if facilities.state === 'success'}
					<div class="divide-y">
						{#each facilities.data.filter((facility) => facility.name
								.toLowerCase()
								.includes(searchText.toLowerCase())) as facility}
							<button
								class="inline-flex w-full flex-col px-3 py-1.5 text-left hover:bg-muted"
								onclick={async () => {
									const toastId = toast.loading('Assigning facility to event');
									try {
										const { id } = await assignFacilityToEvent(event.id, facility.id, allotment.id);
										allotment.facilities.push({
											facility: facility,
											id: id,
											venueAllotmentId: allotment.id
										});
										open = false;
									} catch (err: any) {
										toast.error(err.message ?? 'Something went wrong', {
											id: toastId
										});
									}
								}}
							>
								<div class="text-sm font-medium">{facility.name}</div>
								<div class="text-xs text-muted-foreground">{facility.type.name}</div>
							</button>
						{:else}
							<p class="text-center px-3 py-1.5 text-muted-foreground text-sm">Nothing here!</p>
						{/each}
					</div>
				{:else}
					<p class="px-3 py-1.5 text-center text-sm text-destructive">{facilities.message}</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
