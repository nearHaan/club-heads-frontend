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
	import type {
		Facility,
		FacilityAssociationMethod,
		FacilityOverlapPolicy,
		FacilityType,
		FacilityWorkflowParticipationPolicy,
		LoadedData,
		Venue
	} from '$lib/types';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import { Loader } from '@lucide/svelte';
	import { createFacility } from '$lib/api/facilities';
	import { loadFacilityTypes } from '$lib/api/facility-types';
	import { Select } from '$lib/components/ui/select';

	let form: HTMLFormElement;
	let {
		open = $bindable(false),
		facilities = $bindable()
	}: { open: boolean; facilities: LoadedData<Facility[]> } = $props();

	let errorText = $state('');

	let type: FacilityType | null = $state(null);
	let organizationId: number | null = $state(null);
	let association: FacilityAssociationMethod = $state('event');
	let overlapPolicy: FacilityOverlapPolicy = $state('exclusive');
	let workflowParticipationPolicy: FacilityWorkflowParticipationPolicy = $state('include');

	type SelectItem<T extends string> = {
		value: T;
		label: string;
	};

	const associationMethods: SelectItem<FacilityAssociationMethod>[] = [
		{ value: 'event', label: 'Event' },
		{ value: 'venue_allotment', label: 'Venue' }
	];
	const overlapPolicies: SelectItem<FacilityOverlapPolicy>[] = [
		{ value: 'shared', label: 'Shared' },
		{ value: 'exclusive', label: 'Exclusive' }
	];
	const workflowParticipationPolicies: SelectItem<FacilityWorkflowParticipationPolicy>[] = [
		{ value: 'include', label: 'Include' },
		{ value: 'exclude', label: 'Exclude' }
	];

	let addLoading = $state(false);

	async function handleSubmit(
		e: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) {
		e.preventDefault();
		if (facilities.state !== 'success') return;
		try {
			const formData = new FormData(e.currentTarget);

			const name = formData.get('name')?.toString().trim();
			// const unavailabilityReason = formData.get('unavailabilityReason')?.toString().trim();

			if (
				!name ||
				name.length === 0 ||
				type == null ||
				type.id == null ||
				!maxCapacity ||
				!organizationId
			) {
				errorText = 'Name, Venue Type, Capacity and organization are required fields';
				return;
			}
			errorText = '';
			addLoading = true;
			const { id } = await createFacility({
				name: name,
				typeId: type.id,
				association: association,
				overlapPolicy: overlapPolicy,
				workflowParticipationPolicy: workflowParticipationPolicy
			});
			facilities.data.push({
				id: id,
				name: name,
				type: {
					id: type.id,
					name: type.name
				},
				association: association,
				overlapPolicy: overlapPolicy,
				workflowParticipationPolicy: workflowParticipationPolicy,
				isAvailable: false,
				providers: []
			});
			form.reset();
			association = 'event';
			type = null;
			open = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			addLoading = false;
		}
	}
</script>

<SideSheet
	title="Add Facility"
	description="Enter the details of the new facility. Click save when you're done"
	bind:sheetOpen={open}
	{errorText}
>
	<form bind:this={form} class="flex h-full flex-col gap-y-6" onsubmit={handleSubmit}>
		<div class="grid gap-y-xxs">
			<Label for="name">Facility Name</Label>
			<Input id="name" name="name" class="primary-input" placeholder="e.g. Generator" required />
		</div>

		<div class="grid gap-y-xxs">
			<Label for="facilityTypeId">Facility Type</Label>
		</div>

		<div class="grid gap-y-xxs">
			<Label for="association">Association</Label>
			<SelectButton
				name="association"
				bind:value={association}
				itemsList={associationMethods}
				class="w-full"
				optionName="label"
				optionValue="value"
			/>
		</div>

		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button disabled={addLoading} type="submit">
				{#if addLoading}
					<Loader size="15" class="animate-spin" />
				{/if} Save changes
			</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
