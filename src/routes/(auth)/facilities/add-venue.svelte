<script lang="ts">
	import { createVenue } from '$lib/api/venue.js';
	import { loadOrgs } from '$lib/api/organizations.js';
	import { loadVenueTypes } from '$lib/api/venue-types.js';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { LoadedData, Venue } from '$lib/types';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import { Loader } from '@lucide/svelte';

	let form: HTMLFormElement;
	let {
		open = $bindable(false),
		venues = $bindable()
	}: { open: boolean; venues: LoadedData<Venue[]> } = $props();

	let errorText = $state('');

	let venueTypeId: number | null = $state(null);
	let organizationId: number | null = $state(null);
	let accessLevel: 'public' | 'private' = $state('public');
	let isAvailable = $state(true);

	const accessLevels = [
		{ value: 'public', label: 'Public' },
		{ value: 'private', label: 'Private' }
	];
	let addLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (venues.state !== 'success') return;
		try {
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name')?.toString().trim();
			const maxCapacity = Number(formData.get('maxCapacity') as string);
			const unavailabilityReason = formData.get('unavailabilityReason')?.toString().trim();

			if (!name || name.length === 0 || !venueTypeId || !maxCapacity || !organizationId) {
				errorText = 'Name, Venue Type, Capacity and organization are required fields';
				return;
			}
			errorText = '';
			addLoading = true;
			const { id } = await createVenue({
				name,
				venueTypeId: venueTypeId,
				organizationId: organizationId,
				maxCapacity,
				accessLevel,
				isAvailable,
				unavailabilityReason: isAvailable ? undefined : unavailabilityReason
			});
			venues = {
				state: 'success',
				data: [
					...venues.data,
					{
						id: id,
						name,
						accessLevel,
						isAvailable,
						isActive: false,
						maxCapacity,
						organizationId,
						unavailabilityReason: unavailabilityReason ? unavailabilityReason : '',
						venueTypeId
					}
				]
			};
			form.reset();
			accessLevel = 'public';
			isAvailable = true;
			venueTypeId = null;
			organizationId = null;
			open = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			addLoading = false;
		}
	}
</script>

<SideSheet
	title="Add Venue"
	description="Enter the details of the new venue. Click save when you're done"
	bind:sheetOpen={open}
	{errorText}
>
	<form bind:this={form} class="flex h-full flex-col gap-y-6" onsubmit={handleSubmit}>
		<div class="grid gap-y-xxs">
			<Label for="name">Venue Name</Label>
			<Input id="name" name="name" class="primary-input" placeholder="e.g. Auditorium" required />
		</div>

		<div class="grid gap-y-xxs">
			<Label for="venueTypeId">Venue Type</Label>
			<DynamicSelectButton
				name="venue type"
				class="w-full"
				bind:value={venueTypeId}
				loadFn={loadVenueTypes}
			/>
		</div>

		<div class="grid gap-y-xxs">
			<Label for="organizationId">Organization (Optional)</Label>
			<DynamicSelectButton
				name="organizationId"
				class="w-full"
				bind:value={organizationId}
				loadFn={loadOrgs}
			/>
		</div>

		<div class="grid gap-y-xxs">
			<Label for="maxCapacity">Max Capacity</Label>
			<Input
				id="maxCapacity"
				name="maxCapacity"
				type="number"
				class="primary-input"
				placeholder="e.g. 500"
				required
			/>
		</div>

		<div class="grid gap-y-xxs">
			<Label for="accessLevel">Access Level</Label>
			<SelectButton
				name="accessLevel"
				bind:value={accessLevel}
				itemsList={accessLevels}
				class="w-full"
				optionName="label"
				optionValue="value"
			/>
		</div>

		<div class="flex items-center space-x-2 py-xxs">
			<Checkbox id="isAvailable" bind:checked={isAvailable} />
			<Label
				for="isAvailable"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Available for Booking
			</Label>
		</div>

		{#if !isAvailable}
			<div class="grid gap-y-xxs">
				<Label for="unavailabilityReason">Unavailability Reason</Label>
				<Textarea
					id="unavailabilityReason"
					name="unavailabilityReason"
					placeholder="Reason for being unavailable..."
					required
				/>
			</div>
		{/if}
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button disabled={addLoading} type="submit"
				>{#if addLoading}
					<Loader size="15" class="animate-spin" />
				{/if} Save changes</Button
			>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
