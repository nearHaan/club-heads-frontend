<script lang="ts">
	import { assignFacilityToEvent } from '$lib/api/events';
	import { getEventAssociatedFacilities } from '$lib/api/facilities';
	import { getVenueById, getVenueByIdInDetail } from '$lib/api/venue';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { type EventDetail, type LoadedData, type VenueDetail } from '$lib/types';
	import { Delete, Plus, Search } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		event = $bindable()
	}: {
		open?: boolean;
		event: EventDetail;
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

	let searchText = $state('');
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<Plus class="inline size-4" />
	</Dialog.Trigger>
	<Dialog.Content class="flex max-h-[80vh] flex-col p-3">
		<Dialog.Header>
			<Dialog.Title>Assign facility to event</Dialog.Title>
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
									if (facilities.state !== 'success') return;
									const toastId = toast.loading('Assigning facility to event');
									try {
										const { id } = await assignFacilityToEvent(event.id, facility.id);
										event.facilities.push({
											facility: facility,
											id: id,
											venueAllotmentId: null
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
