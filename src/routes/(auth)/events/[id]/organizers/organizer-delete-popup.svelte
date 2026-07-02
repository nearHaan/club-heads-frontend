<script lang="ts">
	import { removeOrganizerInvitation } from '$lib/api/events/organizer-invitations';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import {
		type AuthUser,
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Loader } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		eventId,
		invitationId,
		eventName,
		organizations,
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		organizationId,
		organizationName
	}: {
		isOpen: boolean;
		eventId: number;
		invitationId: number;
		eventName: string;
		organizations: LoadedData<Organization[]>;
		organizers: EventOrganizer[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
		organizationId: number;
		organizationName: string;
	} = $props();

	let errorText = $state('');
	let loading = $state(false);

	async function deleteInvitation() {
		if (organizations.state !== 'success') return;
		if (organizerInvitations.state !== 'success') return;
		if (selectedUserRoleId === null) {
			errorText = 'Select a role from drop-down';
			return;
		}
		errorText = '';
		try {
			loading = true;
			const { id } = await removeOrganizerInvitation(eventId, invitationId, selectedUserRoleId);
			organizerInvitations.data = [
				...organizerInvitations.data.filter((o) => o.id !== invitationId)
			];
			isOpen = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			loading = false;
		}
	}

	let user: AuthUser | null = null;
	let roles: AuthUser['memberships'][0]['roles'] = $state([]);
	let selectedUserRoleId: null | number = $state(null);
	let userOrgName: string | null = $state(null);

	$effect(() => {
		user = authInfo.get();
		if (!user) return;
		userOrgName = organizers.find((o) => o.role === 'host')?.organization.name!;
		roles = user.memberships.find(
			(m) => m.id === organizers.find((o) => o.role === 'host')?.organization.id
		)?.roles!;
		if (roles.length === 1) {
			selectedUserRoleId = roles[0].id;
		}
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-xl">
			<p class="/bg-muted border-b px-3 py-4 text-sm">Delete Invite</p>
			<div class="flex min-w-60 flex-col gap-2.5 p-3">
				<p class="text-sm leading-6">
					I <span
						>{#if roles.length === 1}
							<span class="h-8 border border-muted-foreground bg-primary/10 p-0.5 px-xxs"
								>{roles[0].name}</span
							>
						{:else}
							<select
								bind:value={selectedUserRoleId}
								class="h-8 border border-muted-foreground bg-primary/10 p-0.5 px-xxs"
							>
								{#each roles as role}
									<option value={role.id}>{role.name}</option>
								{/each}
							</select>
						{/if}</span
					>
					of {userOrgName},delete the invitation sent to
					<span class="font-bold">{organizationName}</span>
					for the role
					<span class="font-bold">Co-Host</span>
					for the event
					<span class="italic">{eventName}</span>
				</p>
				{#if errorText}
					<p class="text-xs text-red-500">{errorText}</p>
				{/if}
				<div class="flex w-full justify-end gap-2.5 text-sm">
					<button
						type="button"
						onclick={() => {
							isOpen = false;
						}}
						class="px-2 py-2 text-muted-foreground">Go Back</button
					>
					<button
						type="button"
						onclick={deleteInvitation}
						disabled={loading}
						class="flex items-center px-2 py-2 font-bold text-foreground"
						>{#if loading}<Loader size="15" class="animate-spin" />
						{/if} Confirm</button
					>
				</div>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
