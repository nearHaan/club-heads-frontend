<script lang="ts">
	import { loadVenues } from '$lib/api/venue';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { type EventVenueAllotment, type LoadedData, type Venue } from '$lib/types';
	import { Search, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		isDateTimePopupOpen = $bindable(false),
		allotedVenues = $bindable(),
		selectedVenue = $bindable()
	}: {
		isOpen: boolean;
		isDateTimePopupOpen: boolean;
		allotedVenues: EventVenueAllotment[];
		selectedVenue: null | Venue;
	} = $props();

	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading venues...'
	});

	let filteredVenues = $derived.by(() => {
		if (venues.state !== 'success') return [];
		return venues.data.filter((v) => v.name.toLowerCase().includes(searchText.toLowerCase()));
	});

	let searchText = $state('');

	$effect(() => {
		(async () => {
			try {
				venues = {
					state: 'success',
					data: await loadVenues()
				};
			} catch (err: any) {
				venues = {
					state: 'failed',
					message: err.message ?? 'Failed to load venues'
				};
			}
		})();
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-lg">
			<div class="flex flex-col gap-sm p-sm">
				<p class="mr-5 text-lg">Allot a new venue for the event</p>
				<div class="flex h-10 w-full items-center gap-x-xxs rounded bg-muted p-xxs">
					<Search class="text-muted-foreground" size="20" />
					<input
						bind:value={searchText}
						onchange={(e) => (searchText = e.currentTarget.value)}
						type="text"
						placeholder="Search venues"
						class="w-full text-foreground placeholder:text-muted-foreground focus:outline-none"
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
				<div class="h-50 w-full overflow-auto rounded bg-muted">
					{#if venues.state === 'pending' || venues.state === 'failed'}
						<p class="p-xs text-xs text-muted-foreground">{venues.message}</p>
					{:else}
						<div>
							{#each filteredVenues as v}
								<button
									onclick={() => {
										selectedVenue = v;
										isDateTimePopupOpen = true;
										isOpen = false;
									}}
									class="flex w-full cursor-pointer items-center justify-start gap-xs border-b p-xs last:border-b-0 hover:bg-neutral-200"
								>
									<p class="text-left text-sm">{v.name}</p>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<p class="text-xs">Choose one to continue</p>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
