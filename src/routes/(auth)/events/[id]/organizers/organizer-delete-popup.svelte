<script lang="ts">
	import { removeOrganizerInvitation } from '$lib/api/events/organizer-invitations';
	import { removeOrganizer } from '$lib/api/events/organizers';
	import Button from '$lib/components/ui/button/button.svelte';
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
	import { Loader, SquareArrowRightExit, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		eventId,
		itemId,
		role,
		eventName,
		organizations,
		type,
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		organizationName
	}: {
		isOpen: boolean;
		eventId: number;
		itemId: number;
		role: EventOrganizerRole;
		eventName: string;
		type: 'organizer' | 'invitation';
		organizations: LoadedData<Organization[]>;
		organizers: {
			id: number;
			organization: {
				id: number;
				name: string;
			};
			role: EventOrganizerRole;
		}[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
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
			const { id } = await removeOrganizerInvitation(eventId, itemId, selectedUserRoleId);
			organizerInvitations.data = [...organizerInvitations.data.filter((o) => o.id !== itemId)];
			isOpen = false;
		} catch (err: any) {
			errorText = err.message;
		} finally {
			loading = false;
		}
	}

	async function deleteOrganizer() {
		try {
			loading = true;
			await removeOrganizer(eventId, itemId);
			organizers = organizers.filter((o) => o.id !== itemId);
			organizers = [...organizers];
			isOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Failed to delete organizer';
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
		<p class="mt-1 text-sm text-muted-foreground">Delete Organizer</p>
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
				of {userOrgName},{#if type === 'invitation'}
					delete the invitation sent to
					<span class="font-bold">{organizationName}</span>
					for the role
					<span class="font-bold">Co-Host</span>
				{:else}
					remove <span class="font-bold">{organizationName}</span> from the organizers list
				{/if}
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
				variant="destructive"
				class="flex-1"
				onclick={() => {
					if (type === 'invitation') {
						deleteInvitation();
					} else if (type === 'organizer') {
						deleteOrganizer();
					}
				}}
			>
				{#if loading}<Loader class="animate-spin" />
				{:else}
					<X />
				{/if}
				Delete
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
