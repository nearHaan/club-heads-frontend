<script lang="ts">
	import { loadParentableEvents } from '$lib/api/events';
	import { loadVenues } from '$lib/api/venue';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import {
		type EventVenueAllotment,
		type LoadedData,
		type ParentableEvent,
		type Venue
	} from '$lib/types';
	import { Search, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		selectedEvent = $bindable(),
		organizationId,
		eventTypeId
	}: {
		isOpen: boolean;
		selectedEvent: ParentableEvent | null;
		organizationId: number;
		eventTypeId: number;
	} = $props();

	let parentableEvents = $state<LoadedData<ParentableEvent[]>>({
		state: 'pending',
		message: 'Loading venues...'
	});

	$effect(() => {
		(async () => {
			parentableEvents = {
				state: 'pending',
				message: 'Loading events'
			};
			try {
				parentableEvents = {
					state: 'success',
					data: await loadParentableEvents(eventTypeId, organizationId)
				};
			} catch (err: any) {
				parentableEvents = {
					state: 'failed',
					message: 'Failed to load parentable events'
				};
			}
		})();
	});

	let filteredEvents = $derived.by(() => {
		if (parentableEvents.state !== 'success') return [];
		return parentableEvents.data.filter((v) =>
			v.title.toLowerCase().includes(searchText.toLowerCase())
		);
	});

	let searchText = $state('');
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-lg">
			<div class="flex flex-col gap-sm p-sm">
				<p class="mr-5 text-sm">Possible Events</p>
				<div class="flex h-10 w-full items-center gap-x-xxs rounded-sm border p-xxs">
					<Search class="text-muted-foreground" size="20" />
					<input
						bind:value={searchText}
						onchange={(e) => (searchText = e.currentTarget.value)}
						type="text"
						placeholder="Search venues"
						class="w-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
					/>
					{#if searchText && searchText.trim().length > 0}
						<button
							class="cursor-pointer"
							onclick={() => {
								searchText = '';
							}}><X size="15" /></button
						>
					{/if}
				</div>
				<div class="h-50 w-full overflow-auto rounded-sm bg-muted">
					{#if parentableEvents.state === 'pending' || parentableEvents.state === 'failed'}
						<p class="p-xs text-xs text-muted-foreground">{parentableEvents.message}</p>
					{:else}
						<div>
							{#if filteredEvents.length === 0}
								<p class="p-xs text-xs text-muted-foreground">No events found</p>
							{/if}
							{#each filteredEvents as e}
								<button
									onclick={() => {
										selectedEvent = e;
										isOpen = false;
									}}
									class="flex w-full cursor-pointer items-center justify-start gap-xs border-b p-xs text-sm last:border-b-0 hover:bg-neutral-200"
								>
									{e.title}
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<p class="text-sm">Choose one to continue</p>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
