<script lang="ts">
	import { loadUsers } from '$lib/api/users.js';
	import { loadVenueTypeRoles } from '$lib/api/venue-types.js';
	import { addMemberToVenue } from '$lib/api/venue.js';
	import DynamicSelectButton from '$lib/components/app/dynamic-select-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { venueAssignState } from '$lib/global/venueAssign.svelte';
	import type { User, VenueType } from '$lib/types';
	import { ArrowRightIcon, ArrowDownIcon } from '@lucide/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let userValue = $state('');
	let roleValue = $state('');
	let errorText = $state('');
	let successText = $state('');

	async function handleAddMember() {
		try {
			if (!venueAssignState.selectedVenue || !userValue || !roleValue) {
				errorText = 'Please select both a user and a role.';
				return;
			}
			errorText = '';
			successText = '';
			await addMemberToVenue(venueAssignState.selectedVenue.id, {
				userId: parseInt(userValue),
				roleId: parseInt(roleValue)
			});
			successText = 'Member added successfully!';
			userValue = '';
			roleValue = '';
		} catch (err: any) {
			errorText = err.message;
		}
	}
</script>

<Sheet.Root bind:open={venueAssignState.assignSheetOpen}>
	<Sheet.Content class="h-screen w-full sm:min-w-120" side="right">
		<form onsubmit={(e) => { e.preventDefault(); handleAddMember(); }}>
			<Sheet.Header>
				<Sheet.Title>Assign Members to Venue</Sheet.Title>
				<Sheet.Description>
					Select a user and a role to add them to {venueAssignState.selectedVenue?.name ?? 'the venue'}.
				</Sheet.Description>
			</Sheet.Header>
			<div class="mx-xs flex h-full flex-col overflow-auto py-4">
				{#if errorText}
					<p class="text-sm text-red-500 mb-4">{errorText}</p>
				{/if}
				{#if successText}
					<p class="text-sm text-green-500 mb-4">{successText}</p>
				{/if}

				<div class="sticky bottom-0 z-10 flex flex-col pt-4">
					<Separator class="my-xs" />
					<div
						class="flex items-center justify-center rounded-lg bg-secondary p-xs max-sm:flex-col gap-2"
					>
						<div class="grid w-full gap-3">
							<DynamicSelectButton
								name="user"
								initialText="Select a User"
								size="full"
								bind:value={userValue}
								loadFn={loadUsers}
								mapOption={(item: User) => ({ value: item.id.toString(), label: item.fullName })}
								isBg={true}
							/>
						</div>
						<ArrowRightIcon size={30} class="m-xs text-secondary-foreground max-sm:hidden" />
						<ArrowDownIcon size={15} class="m-xs text-secondary-foreground sm:hidden" />
						<div class="grid w-full gap-3">
							<DynamicSelectButton
								name="role"
								initialText="Select a Role"
								size="full"
								bind:value={roleValue}
								loadFn={() => venueAssignState.selectedVenue ? loadVenueTypeRoles(venueAssignState.selectedVenue.venueTypeId) : Promise.resolve([])}
								mapOption={(item: { id: number; name: string }) => ({ value: item.id.toString(), label: item.name })}
								isBg={true}
							/>
						</div>
					</div>
					<Button type="submit" class="mt-xs" variant="default">Add Member</Button>
				</div>
			</div>
		</form>
		<Sheet.Footer>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
