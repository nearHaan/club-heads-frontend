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
	import type { Organization, VenueType } from '$lib/types';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let errorText = $state('');

	let venueTypeId = $state('');
	let organizationId = $state('');
	let accessLevel = $state('public');
	let isAvailable = $state(true);

	const accessLevels = [
		{ value: 'public', label: 'Public' },
		{ value: 'private', label: 'Private' }
	];

	const accessTriggerContent = $derived(
		accessLevels.find((a) => a.value === accessLevel)?.label ?? 'Public'
	);

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name') as string;
			const maxCapacity = parseInt(formData.get('maxCapacity') as string);
			const unavailabilityReason = formData.get('unavailabilityReason') as string;

			if (!name || !venueTypeId || !maxCapacity) {
				errorText = 'Name, Venue Type, and Capacity are required.';
				return;
			}

			await createVenue({
				name,
				venueTypeId: parseInt(venueTypeId),
				organizationId: organizationId ? parseInt(organizationId) : null,
				maxCapacity,
				accessLevel,
				isAvailable,
				unavailabilityReason: isAvailable ? null : unavailabilityReason
			});

			console.log('Venue Added');
			open = false;
		} catch (err: any) {
			errorText = err.message;
		}
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto h-full flex flex-col">
				<Sheet.Header class="mb-xs border-b border-muted-foreground pb-2">
					<div class="flex flex-col">
						<h2 class="text-lg font-bold">Add Venue</h2>
						<h3 class="text-sm">Enter the details of the new venue. Click save when you're done.</h3>
					</div>
				</Sheet.Header>
				<div class="grid flex-1 auto-rows-min gap-6 px-4 py-6 overflow-y-auto">
					{#if errorText}
						<p class="text-sm text-red-500">{errorText}</p>
					{/if}
					
					<div class="grid gap-3">
						<Label for="name">Venue Name</Label>
						<Input id="name" name="name" class="primary-input" placeholder="e.g. Auditorium" required />
					</div>

					<div class="grid gap-3">
						<Label for="venueTypeId">Venue Type</Label>
						<DynamicSelectButton
							name="venueTypeId"
							initialText="Select Venue Type"
							size="full"
							bind:value={venueTypeId}
							loadFn={loadVenueTypes}
							mapOption={(item: VenueType) => ({ value: item.id.toString(), label: item.name })}
						/>
					</div>

					<div class="grid gap-3">
						<Label for="organizationId">Organization (Optional)</Label>
						<DynamicSelectButton
							name="organizationId"
							initialText="Managed by Organization"
							size="full"
							bind:value={organizationId}
							loadFn={loadOrgs}
							mapOption={(item: Organization) => ({ value: item.id.toString(), label: item.name })}
						/>
					</div>

					<div class="grid gap-3">
						<Label for="maxCapacity">Max Capacity</Label>
						<Input id="maxCapacity" name="maxCapacity" type="number" class="primary-input" placeholder="e.g. 500" required />
					</div>

					<div class="grid gap-3">
						<Label for="accessLevel">Access Level</Label>
						<SelectButton
							name="accessLevel"
							label="Access Level"
							bind:value={accessLevel}
							trigContent={accessTriggerContent}
							items={accessLevels}
							size="full"
						/>
					</div>

					<div class="flex items-center space-x-2 py-2">
						<Checkbox id="isAvailable" bind:checked={isAvailable} />
						<Label for="isAvailable" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Available for Booking
						</Label>
					</div>

					{#if !isAvailable}
						<div class="grid gap-3">
							<Label for="unavailabilityReason">Unavailability Reason</Label>
							<Textarea id="unavailabilityReason" name="unavailabilityReason" placeholder="Reason for being unavailable..." required />
						</div>
					{/if}
				</div>
				<Sheet.Footer class="mt-auto border-t pt-4">
					<Button type="submit">Save changes</Button>
					<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
				</Sheet.Footer>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>
