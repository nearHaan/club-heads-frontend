<script lang="ts">
	import { getVenueFacilities, setVenueFacilities } from '$lib/api/venue.js';
	import { loadFacilityTypes } from '$lib/api/facilities.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { LoadedData, VenueFacility } from '$lib/types';
	import { Loader, PlusIcon, TrashIcon } from '@lucide/svelte';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';

	let facilities = $state<LoadedData<{ id: number; name: string }[]>>({
		state: 'pending',
		message: 'Loading facilities...'
	});
	let linkedFacilities = $state<LoadedData<VenueFacility[]>>({
		state: 'pending',
		message: 'Loading facilities...'
	});
	let selectedFacilityId: null | number = $state(null);
	let {
		sheetOpen = $bindable(false),
		activeVenueId,
		activeVenueName
	}: { sheetOpen: boolean; activeVenueId: number; activeVenueName: string } = $props();

	let errorText = $state('');
	let addLoading = $state(false);
	let deletingFacilityId: null | number = $state(null);

	onMount(async () => {
		try {
			facilities = {
				state: 'success',
				data: await loadFacilityTypes()
			};
		} catch (err: any) {
			facilities = {
				state: 'failed',
				message: 'Failed to load'
			};
		}
	});

	async function loadLinkedFacilities(venueId: number) {
		linkedFacilities = { state: 'pending', message: 'Loading facilities...' };
		try {
			const data = await getVenueFacilities(venueId);
			linkedFacilities = { state: 'success', data: data.flat() };
		} catch (err) {
			linkedFacilities = { state: 'failed', message: 'Failed to load facilities' };
		}
	}

	$effect(() => {
		if (activeVenueId) {
			(async () => {
				await loadLinkedFacilities(activeVenueId);
			})();
		}
	});

	async function handleLinkFacility() {
		if (linkedFacilities.state !== 'success') return;
		if (facilities.state !== 'success') return;
		if (!selectedFacilityId) {
			errorText = 'Please select a facility';
			return;
		}
		errorText = '';
		try {
			addLoading = true;
			await setVenueFacilities(activeVenueId, [
				...linkedFacilities.data.map((f) => f.facilityId),
				selectedFacilityId
			]);
			linkedFacilities = {
				state: 'success',
				data: [
					...linkedFacilities.data,
					{
						id: 0,
						facilityId: selectedFacilityId,
						facilityName: facilities.data.find((f) => f.id === selectedFacilityId)?.name!
					}
				]
			};
			selectedFacilityId = null;
		} catch (err: any) {
			errorText = err.message ?? 'Error';
		} finally {
			addLoading = false;
		}
	}

	async function handleUnlinkFacility(facilityId: number) {
		if (linkedFacilities.state !== 'success') return;
		if (facilities.state !== 'success') return;
		try {
			deletingFacilityId = facilityId;
			await setVenueFacilities(
				activeVenueId,
				linkedFacilities.data.map((lf) => lf.facilityId).filter((lf) => lf !== facilityId)
			);
			linkedFacilities = {
				state: 'success',
				data: linkedFacilities.data.filter((lf) => lf.facilityId !== facilityId)
			};
		} catch (err: any) {
			errorText = err.message ?? 'Error';
		} finally {
			deletingFacilityId = null;
		}
	}
</script>

<SideSheet
	{errorText}
	title={activeVenueName}
	description="Manage facilities linked to this venue"
	{sheetOpen}
>
	<div class="border border-muted-foreground bg-muted">
		{#if linkedFacilities.state === 'pending'}
			<p class="p-xs text-sm">{linkedFacilities.message}</p>
		{:else if linkedFacilities.state === 'success'}
			{#each linkedFacilities.data as facility}
				<div
					transition:slide
					class="flex w-full items-center justify-start rounded-none border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
				>
					<p class="w-full py-xs">{facility.facilityName}</p>
					{#if deletingFacilityId !== null && deletingFacilityId === facility.facilityId}
						<Loader size="15" class="animate-spin" />
					{:else}
						<Button
							disabled={deletingFacilityId !== null && deletingFacilityId === facility.facilityId}
							onclick={() => handleUnlinkFacility(facility.facilityId)}
							class="text-red-400"
							size="icon"
							variant="ghost"><TrashIcon /></Button
						>
					{/if}
				</div>
			{/each}
			{#if linkedFacilities.data.length === 0}
				<p class="p-xs text-sm italic">No facilities linked yet.</p>
			{/if}
			<div class="flex">
				{#if facilities.state === 'success'}
					<SelectButton
						bind:value={selectedFacilityId}
						name="facility"
						class="w-full"
						itemsList={facilities.data.filter(
							(f) =>
								linkedFacilities.state === 'success' &&
								!linkedFacilities.data.find((lf) => lf.facilityId === f.id)
						)}
						optionName="name"
						optionValue="id"
					/>
				{/if}
				<Button
					disabled={addLoading}
					variant="link"
					onclick={handleLinkFacility}
					class="rounded-none"
					><PlusIcon />{#if addLoading}
						<Loader size="15" class="animate-spin" />
					{/if} Add</Button
				>
			</div>
		{:else}
			<p class="p-xs text-sm">Failed to load facilities.</p>
		{/if}
	</div>
</SideSheet>
