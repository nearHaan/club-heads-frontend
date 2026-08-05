<script lang="ts">
	import { createOrg, loadOrgs, loadOrgTypes } from '$lib/api/organizations';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import type { LoadedData, Organization, OrganizationType } from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let errorText = $state('');

	let form: HTMLFormElement;
	let name = $state('');
	let org: Organization | null = $state(null);
	let type: OrganizationType | null = $state(null);
	let addLoading = $state(false);

	let {
		addSheetOpen = $bindable(false),
		organizations = $bindable()
	}: { addSheetOpen: boolean; organizations: LoadedData<Organization[]> } = $props();

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		try {
			if (organizations.state !== 'success') return;
			addLoading = true;
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name')?.toString().trim();
			if (!name || org === null || type === null) {
				errorText = 'All are required fields.';
				return;
			}
			errorText = '';
			const { id } = await createOrg(name, type.id, org.id);
			organizations = {
				state: 'success',
				data: [
					...organizations.data,
					{
						id: id,
						name: name,
						isActive: false,
						organizationTypeId: type.id,
						parentOrganizationId: org.id
					}
				]
			};
			form.reset();
			type = null;
			org = null;
			addSheetOpen = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			addLoading = false;
		}
	}
</script>

<SideSheet
	{errorText}
	title="Add Organization"
	description="Enter the details of the new organization. Click save when you're done"
	bind:sheetOpen={addSheetOpen}
>
	<form bind:this={form} onsubmit={handleSubmit} class="flex h-full flex-col gap-y-sm">
		<div class="grid gap-3">
			<Label for="name" class="text-end">Name</Label>
			<Input class="primary-input" bind:value={name} name="name" />
		</div>
		<div class="grid gap-3">
			<Label for="email" class="text-end">Type</Label>
			<DynamicSelectButton name="type" bind:value={type} loadFn={loadOrgTypes} />
		</div>
		<div class="grid gap-3">
			<Label for="org" class="text-end">Parent Organization</Label>
			<DynamicSelectButton name="parent organization" bind:value={org} loadFn={loadOrgs} />
		</div>
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
