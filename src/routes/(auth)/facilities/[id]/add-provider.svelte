<script lang="ts">
	import { addProviderToFacility } from '$lib/api/facilities';
	import { loadOrgs } from '$lib/api/organizations';
	import { loadVenues } from '$lib/api/venue';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import type { EntityType, Facility, Organization, Venue } from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let { open = $bindable(), facility = $bindable() }: { open: boolean; facility: Facility } =
		$props();

	let kindTypes: EntityType[] = ['organization', 'venue'];

	let errorText = $state('');
	let selectedKindType: Exclude<EntityType, 'facility'> | null = $state(null);
	let selectedKind: Organization | Venue | null = $state(null);
	let addLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (selectedKind === null || selectedKindType === null) {
			errorText = 'Select a valid Provider';
			return;
		}
		try {
			addLoading = true;
			const providerData = { providerType: selectedKindType, providerId: selectedKind.id };
			const { id } = await addProviderToFacility(facility.id, providerData);
			facility.providers = [
				...facility.providers,
				{
					id: id,
					scope: {
						id: selectedKind.id,
						kind: { id: 0, name: ''},
						name: selectedKind.name,
						type: selectedKindType
					}
				}
			];
			open = false
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			addLoading = false;
		}
	}
</script>

<SideSheet
	bind:sheetOpen={open}
	title="Add Provider"
	description="Choose a venue or organization to be a provider of this facility"
	{errorText}
>
	<form onsubmit={handleSubmit} class="flex h-full flex-col gap-y-6">
		<div class="grid gap-y-xxs">
			<Label for="kind">Provider Kind</Label>
			<SelectButton
				name="providerKind"
				itemsList={kindTypes}
				bind:value={selectedKindType}
				transformName={(v) => v[0].toUpperCase() + v.substring(1)}
			/>
		</div>

		<div class="grid gap-y-xxs">
			{#if selectedKindType === 'organization'}
				<Label for="kind">Organization</Label>
				<DynamicSelectButton name="organization" bind:value={selectedKind} loadFn={loadOrgs} />
			{:else if selectedKindType === 'venue'}
				<Label for="kind">Venue</Label>
				<DynamicSelectButton name="venue" bind:value={selectedKind} loadFn={loadVenues} />
			{/if}
		</div>

		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button disabled={addLoading} type="submit">
				{#if addLoading}
					<Loader size="15" class="animate-spin" />
				{/if} Add
			</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
