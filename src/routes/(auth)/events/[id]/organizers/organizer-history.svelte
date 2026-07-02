<script lang="ts">
	import { loadOrgs } from '$lib/api/organizations';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import {
		eventOrganizerInvitationStatusColors,
		eventOrganizerInvitationStatusTextColors
	} from '$lib/constants';
	import {
		EVENT_ORGANIZER_ROLE,
		type AuthUser,
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Check, ClockAlert, Minus, Search, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		organizerInvitations
	}: {
		isOpen: boolean;
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
	} = $props();

	let filteredOrganizations = $derived.by(() => {
		if (organizerInvitations.state !== 'success') return;
		return organizerInvitations.data.filter((o) =>
			o.recipientOrganization.name.toLowerCase().includes(searchText.toLowerCase())
		);
	});

	let searchText = $state('');
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-lg">
			<div class="flex flex-col gap-sm p-sm">
				<p class="mr-5 text-lg">History</p>
				<div class="flex h-10 w-full items-center gap-x-xxs rounded bg-muted p-xxs">
					<Search class="text-muted-foreground" size="20" />
					<input
						bind:value={searchText}
						onchange={(e) => (searchText = e.currentTarget.value)}
						type="text"
						placeholder="Search organization"
						class="w-full text-foreground placeholder:text-muted-foreground focus:outline-none"
					/>
					{#if searchText && searchText.trim().length > 0}
						<button
							class="cursor-pointer"
							onclick={() => {
								searchText = '';
							}}
						>
							<X size="15" />
						</button>
					{/if}
				</div>
				<div class="h-50 w-full overflow-auto rounded bg-muted">
					{#if organizerInvitations.state === 'pending' || organizerInvitations.state === 'failed'}
						<p class="p-xs text-xs text-muted-foreground">{organizerInvitations.message}</p>
					{:else}
						<div>
							{#each filteredOrganizations as o}
								<div
									class="flex w-full cursor-pointer items-center justify-start gap-xs border-b p-xs last:border-b-0 hover:bg-neutral-200"
								>
									<div
										class={`flex h-4 w-4 items-center justify-center rounded-full ${eventOrganizerInvitationStatusColors[o.status]} ${eventOrganizerInvitationStatusTextColors[o.status]}`}
									>
										{#if o.status === 'accepted'}
											<Check size="10" />
										{:else if o.status === 'expired'}
											<ClockAlert size="10" />
										{:else if o.status === 'rejected'}
											<X size="10" />
										{:else if o.status === 'revoked'}
											<Minus size="10" />
										{/if}
									</div>
									<ShapeAvatarSvg size={20} seed={o.recipientOrganization.name} />
									<p class="text-left text-sm">{o.recipientOrganization.name}</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
