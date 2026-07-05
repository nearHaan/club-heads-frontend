<script lang="ts">
	import { respondToInvitation } from '$lib/api/me/invitations';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { authInfo } from '$lib/global/auth.svelte';
	import { type AuthUser, type LoadedData, type PendingInvitationDetailed } from '$lib/types';
	import { Check, Loader, SquareArrowRightExit } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		invitationId,
		invitationDetailed = $bindable(),
		decision,
		decisionMade = $bindable()
	}: {
		isOpen: boolean;
		invitationId: number;
		invitationDetailed: LoadedData<PendingInvitationDetailed>;
		decision: 'accepted' | 'rejected';
		decisionMade: 'accepted' | 'rejected' | null;
	} = $props();

	let errorText = $state('');
	let loading = $state(false);

	async function respondToInvite() {
		if (invitationDetailed.state !== 'success') return;
		if (selectedUserRoleId === null) {
			errorText = 'Select a role from drop-down';
			return;
		}
		errorText = '';
		try {
			loading = true;
			await respondToInvitation(invitationId, selectedUserRoleId, decision);
			decisionMade = decision;
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

	$effect(() => {
		if (invitationDetailed.state !== 'success') return;
		user = authInfo.get();
		if (!user) return;
		roles = user.memberships.find(
			(m) => m.id === invitationDetailed.data.recipientOrganization.id
		)?.roles!;
		if (roles.length === 1) {
			selectedUserRoleId = roles[0].id;
		}
	});
</script>

{#if invitationDetailed.state === 'success'}
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
					of {invitationDetailed.data.recipientOrganization.name},
					<span class={`${decision === 'accepted' ? 'text-green-600' : 'text-red-600'}`}
						>{decision === 'accepted' ? 'accept' : 'reject'}</span
					>
					the invite sent by
					<span class="font-bold">{invitationDetailed.data.sender.organization.name}</span>
					for the role
					<span class="font-bold"
						>{invitationDetailed.data.intendedRole === 'co_host'
							? 'Co-Host'
							: invitationDetailed.data.intendedRole === 'resource_provider'
								? 'Resource Provider'
								: 'Host'}</span
					>
					for the event
					<span class="italic">{invitationDetailed.data.event.title}</span>
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
					onclick={respondToInvite}
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
{/if}
