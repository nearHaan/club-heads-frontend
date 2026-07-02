<script lang="ts">
	import { loadOrgs } from '$lib/api/organizations';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import {
		EVENT_ORGANIZER_ROLE,
		type AuthUser,
		type EventOrganizer,
		type EventOrganizerInvitation,
		type EventOrganizerRole,
		type LoadedData,
		type Organization
	} from '$lib/types';
	import { Search, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		isConfirmPopupOpen = $bindable(false),
		eventId,
		eventName,
		organizers = $bindable(),
		organizerInvitations = $bindable(),
		role,
		selectedOrgId = $bindable()
	}: {
		isOpen: boolean;
		isConfirmPopupOpen: boolean;
		eventId: number;
		eventName: string;
		organizers: EventOrganizer[];
		organizerInvitations: LoadedData<EventOrganizerInvitation[]>;
		role: EventOrganizerRole;
		selectedOrgId: null | number;
	} = $props();

	let organizations = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations...'
	});

	let allowedOrganizations = $derived.by(() => {
		if (organizations.state !== 'success') return [];
		if (organizerInvitations.state !== 'success') return [];
		return organizations.data.filter(
			(org) =>
				!organizers.map((o) => o.organization.id).includes(org.id) &&
				!organizerInvitations.data
					.filter((o) => o.status === 'pending')
					.map((o) => o.id)
					.includes(org.id)
		);
	});

	let filteredOrganizations = $derived.by(() => {
		return allowedOrganizations.filter((o) =>
			o.name.toLowerCase().includes(searchText.toLowerCase())
		);
	});

	let searchText = $state('');

	$effect(() => {
		(async () => {
			try {
				organizations = {
					state: 'success',
					data: await loadOrgs()
				};
			} catch (err: any) {
				organizations = {
					state: 'failed',
					message: err.message ?? 'Failed to load organizations'
				};
			}
		})();
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-lg">
			<div class="flex flex-col gap-sm p-sm">
				<p class="mr-5 text-lg">
					Invite organization to be {role === 'co_host' ? 'Co-Host' : 'Resource Provider'}
				</p>
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
							}}><X size="15" /></button
						>
					{/if}
				</div>
				<div class="h-50 w-full overflow-auto rounded bg-muted">
					{#if organizations.state === 'pending' || organizations.state === 'failed'}
						<p class="p-xs text-xs text-muted-foreground">{organizations.message}</p>
					{:else}
						<div>
							{#each filteredOrganizations as o}
								<button
									onclick={() => {
										selectedOrgId = o.id;
										isConfirmPopupOpen = true;
										isOpen = false;
									}}
									class="flex w-full cursor-pointer items-center justify-start gap-xs border-b p-xs last:border-b-0 hover:bg-neutral-200"
								>
									<ShapeAvatarSvg size={20} seed={o.name} />
									<p class="text-left text-sm">{o.name}</p>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<p class="text-xs">Choose one to continue</p>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
