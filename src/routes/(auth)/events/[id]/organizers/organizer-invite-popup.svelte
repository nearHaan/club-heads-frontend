<script lang="ts">
	import { addOrganizer } from '$lib/api/events/organizers';
	import { respondEventAssignments } from '$lib/api/me/approval-assignments';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import {
		EVENT_ORGANIZER_ROLE,
		type AuthUser,
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Check, Loader, SquareArrowRightExit } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		eventId,
		eventName,
		organizations,
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		organizationId,
		organizationName,
		role
	}: {
		isOpen: boolean;
		eventId: number;
		eventName: string;
		organizations: LoadedData<Organization[]>;
		organizers: EventOrganizer[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
		organizationId: number;
		organizationName: string;
		role: EventOrganizerRole;
	} = $props();

	let errorText = $state('');
	let loading = $state(false);

	async function sendInvitation() {
		if (organizations.state !== 'success') return;
		if (organizerInvitations.state !== 'success') return;
		if (selectedUserRoleId === null) {
			errorText = 'Select a role from drop-down';
			return;
		}
		errorText = '';
		try {
			loading = true;
			const { id } = await addOrganizer(eventId, selectedUserRoleId, organizationId, role);
			if (role === 'resource_provider') {
				const organization = organizations.data.find((o) => o.id === organizationId)!;
				organizers.push({
					id,
					organization,
					role
				});
				organizers = [...organizers];
			} else if (role === 'co_host') {
				organizerInvitations.data = [
					{
						id: id,
						closedAt: null,
						invitedAt: '',
						invitedByUser: { id: 0, user: { id: 0, fullName: '' } },
						recipientOrganization: {
							id: 0,
							name: organizations.data.find((o) => o.id === organizationId)?.name!
						},
						senderOrganization: { id: 0, name: '' },
						status: 'pending'
					},
					...organizerInvitations.data
				];
			}
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
	<Dialog.Content class="flex flex-col gap-2.5 overflow-hidden rounded-lg p-3 sm:max-w-lg">
		<p class="mt-1 text-sm text-muted-foreground">Confirm Invite</p>
		<div class="flex min-w-60 flex-col gap-2.5 py-2">
			<p class="text-sm leading-5">
				I <span
					>{#if roles.length === 1}
						<span class="h-8 rounded-sm bg-primary/10 p-0.5 px-xxs">{roles[0].name}</span>
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
				of {userOrgName},invite <span class="font-bold">{organizationName}</span> for the role
				<span class="font-bold"
					>{role === 'co_host'
						? 'Co-Host'
						: role === 'resource_provider'
							? 'Resource Provider'
							: 'Host'}</span
				>
				for the event
				<span class="italic">{eventName}</span>
			</p>
			{#if errorText}
				<p class="text-xs text-red-500">{errorText}</p>
			{/if}
		</div>
		<div class="flex w-full gap-2.5 text-sm sm:flex-row">
			<Button
				onclick={() => {
					isOpen = false;
				}}
				size="sm"
				variant="outline"
				class={['flex-1', 'bg-background text-foreground']}
			>
				<SquareArrowRightExit />Go Back
			</Button>
			<Button
				disabled={loading}
				size="sm"
				variant="default"
				class="flex-1"
				onclick={sendInvitation}
			>
				{#if loading}<Loader class="animate-spin" />
				{:else}
					<Check />
				{/if}
				Confirm
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
