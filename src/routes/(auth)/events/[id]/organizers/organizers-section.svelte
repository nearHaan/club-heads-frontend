<script lang="ts">
	import { removeOrganizer } from '$lib/api/events/organizers';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover/index';
	import {
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Blend, History, Link, Loader, Plus, User, X } from '@lucide/svelte';
	import OrganizerDeletePopup from './organizer-delete-popup.svelte';
	import OrganizerHistory from './organizer-history.svelte';
	import OrganizerInvitePopup from './organizer-invite-popup.svelte';
	import OrganizerSelectionPopup from './organizer-selection-popup.svelte';

	let {
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		organizations,
		eventId,
		eventName
	}: {
		organizers: EventOrganizer[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
		organizations: LoadedData<Organization[]>;
		eventId: number;
		eventName: string;
	} = $props();

	let newOrganizerOrganizationId: number | null = $state(null);
	let newOrganizerRole: EventOrganizerRole = $state('co_host');

	let errorText = $state('');

	let deletingOrganizerId: null | number = $state(null);
	async function deleteOrganizer(organizerId: number) {
		try {
			deletingOrganizerId = organizerId;
			await removeOrganizer(eventId, organizerId);
			organizers = organizers.filter((o) => o.id !== organizerId);
			organizers = [...organizers];
		} catch (err: any) {
			errorText = err.message ?? 'Failed to delete organizer';
		} finally {
			deletingOrganizerId = null;
		}
	}

	let orgSelectionPopupOpen = $state(false);
	let orgInviteConfirmPopupOpen = $state(false);
	let deletePopupOpen = $state(false);
	let invitationHistoryPopupOpen = $state(false);
	let deleteInvitationId: null | number = $state(null);
	let popupOrgId: number | null = $state(null);
	let popupRole: EventOrganizerRole | null = $state(null);
</script>

<div class="space-y-2">
	<div class="flex place-items-center justify-between">
		<p class="text-lg font-medium">Organizers</p>

		<div class="flex place-items-center gap-2">
			<Popover.Root>
				<Popover.Trigger
					class={buttonVariants({
						variant: 'ghost',
						size: 'icon-sm',
						class: 'has-[>svg]:p-0 sm:w-min'
					})}
				>
					<Plus />
				</Popover.Trigger>
				<Popover.Content class="w-min p-0" align="end">
					<div class="flex flex-col">
						<Popover.Close
							class={`w-full justify-start ${buttonVariants({ variant: 'outline' })}`}
							onclick={() => {
								popupRole = 'co_host';
								orgSelectionPopupOpen = true;
							}}
						>
							<User />
							<p>Invite Co-Host</p>
						</Popover.Close>
						<Popover.Close
							class={`w-full justify-start ${buttonVariants({ variant: 'outline' })}`}
							onclick={() => {
								popupRole = 'resource_provider';
								orgSelectionPopupOpen = true;
							}}
						>
							<Blend />
							<p>Add Resource Provider</p>
						</Popover.Close>
					</div>
				</Popover.Content>
			</Popover.Root>

			<Button
				variant="ghost"
				size="icon-sm"
				class="has-[>svg]:p-0 sm:w-min"
				onclick={() => {
					invitationHistoryPopupOpen = true;
				}}
			>
				<History />
			</Button>
		</div>
	</div>

	<div class="flex grid-cols-2 flex-col divide-y rounded-lg border sm:grid sm:divide-y-0">
		{#each organizers as o}
			<div
				class="flex place-items-center justify-between gap-4 py-2 pr-2 pl-3 first:rounded-t-lg last:rounded-b-lg"
			>
				<div class="flex place-items-center gap-2.5">
					<ShapeAvatarSvg size={32} seed={o.organization.name} class="rounded-sm" />
					<div>
						<div>{o.organization.name}</div>
						<p class="text-xs text-muted-foreground">
							{#if o.role === 'host'}
								Host
							{:else if o.role === 'co_host'}
								Co-host
							{:else if o.role === 'resource_provider'}
								Resource provider
							{:else}
								{o.role}
							{/if}
						</p>
					</div>
				</div>

				{#if o.role !== 'host'}
					<Button
						variant="ghost"
						size="icon-sm"
						disabled={deletingOrganizerId === o.id}
						onclick={async () => {
							deletingOrganizerId = o.id;
							await deleteOrganizer(o.id);
						}}
					>
						{#if deletingOrganizerId === o.id}
							<Loader class="animate-spin" />
						{:else}
							<X />
						{/if}
					</Button>
				{/if}
			</div>
		{/each}

		{#if organizerInvitations.state === 'success'}
			{#each organizerInvitations.data.filter((o) => o.status === 'pending') as org}
				<div
					class="flex place-items-center justify-between gap-4 py-2 pr-2 pl-3 first:rounded-t-lg last:rounded-b-lg"
				>
					<div class="flex place-items-center gap-2.5">
						<ShapeAvatarSvg size={32} seed={org.recipientOrganization.name} />
						<div>
							<div>{org.recipientOrganization.name}</div>
							<div class="flex place-items-center gap-1 text-xs">
								<div class="text-muted-foreground">Co-host</div>
								&middot;
								<div class="font-bold text-amber-400">Pending</div>
							</div>
						</div>
					</div>

					<Button
						variant="ghost"
						size="icon-sm"
						onclick={() => {
							deleteInvitationId = org.id;
							deletePopupOpen = true;
						}}
					>
						<X />
					</Button>
				</div>
			{/each}
		{/if}
	</div>
</div>

{#if orgInviteConfirmPopupOpen && organizations.state === 'success'}
	<OrganizerInvitePopup
		bind:isOpen={orgInviteConfirmPopupOpen}
		{eventId}
		{eventName}
		{organizations}
		bind:organizerInvitations
		bind:organizers
		organizationId={popupOrgId!}
		organizationName={organizations.data.find((o) => o.id === popupOrgId)?.name ?? ''}
		role={popupRole!}
	/>
{/if}

{#if orgSelectionPopupOpen && organizations.state === 'success'}
	<OrganizerSelectionPopup
		bind:isOpen={orgSelectionPopupOpen}
		bind:isConfirmPopupOpen={orgInviteConfirmPopupOpen}
		{eventId}
		{eventName}
		bind:organizerInvitations
		bind:organizers
		role={popupRole!}
		bind:selectedOrgId={popupOrgId}
	/>
{/if}

{#if deletePopupOpen && organizations.state === 'success'}
	<OrganizerDeletePopup
		bind:isOpen={deletePopupOpen}
		{eventId}
		invitationId={deleteInvitationId!}
		{eventName}
		{organizations}
		bind:organizerInvitations
		bind:organizers
		organizationId={popupOrgId!}
		organizationName={organizations.data.find((o) => o.id === popupOrgId)?.name ?? ''}
	/>
{/if}

<OrganizerHistory bind:isOpen={invitationHistoryPopupOpen} {organizerInvitations} />
