<script lang="ts">
	import { loadApprovalEvents } from '$lib/api/me/approval-assignments';
	import { loadPendingInvitations } from '$lib/api/me/invitations';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';
	import { formatDate, formatDateDayAndMonth } from '$lib/helpers';
	import type { LoadedData, PendingApprovalEvent, PendingInvitation } from '$lib/types';
	import { Calendar, Inbox } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { nav } from './header.svelte';
	// import EventCalendar from '$lib/components/app/event-calendar.svelte';

	let approvalEvents = $state<LoadedData<PendingApprovalEvent[]>>({
		state: 'pending',
		message: 'Loading pending approvals...'
	});
	let pendingInvitations = $state<LoadedData<PendingInvitation[]>>({
		state: 'pending',
		message: 'Loading invitations...'
	});

	onMount(async () => {
		nav.set([{ title: 'Dashboard', url: '/' }]);

		try {
			approvalEvents = {
				state: 'success',
				data: await loadApprovalEvents()
			};
		} catch (err: any) {
			approvalEvents = {
				state: 'failed',
				message: err.message ?? 'Failed to load pending approvals'
			};
		}
		try {
			pendingInvitations = {
				state: 'success',
				data: await loadPendingInvitations()
			};
		} catch (err: any) {
			pendingInvitations = {
				state: 'failed',
				message: err.message ?? 'Failed to load invitations'
			};
		}
	});

	let allEmpty = $derived.by(() => {
		if (approvalEvents.state !== 'success') return false;
		if (pendingInvitations.state !== 'success') return false;
		return approvalEvents.data.length === 0 && pendingInvitations.data.length === 0;
	});
</script>

<div class="mx-auto flex max-w-prose flex-col">
	<div class="flex h-full flex-col gap-y-8 p-r-pad">
		{#if allEmpty}
			<div class="flex h-full w-full flex-col items-center justify-center">
				<div class="flex flex-col items-center px-10 py-20">
					<Inbox />
					<p>You have no messages</p>
					<p class="text-xs text-muted-foreground">Find your important messages here</p>
				</div>
			</div>
		{/if}
		{#if approvalEvents.state === 'pending' || approvalEvents.state === 'failed'}
			<p>{approvalEvents.message}</p>
		{:else if approvalEvents.data.length > 0}
			<div class="flex flex-col gap-y-xs">
				<p class="text-xs text-muted-foreground uppercase">Pending Approvals</p>
				{#each approvalEvents.data as event}
					<a href={`/approvals/${event.id}`} class="no-underline">
						<div
							class="flex min-w-56 flex-col gap-0.5 rounded border bg-background p-xs hover:bg-muted"
						>
							<div class="flex items-start justify-between gap-x-0.5">
								<p class="font-bold">
									{event.title}
									{#if event.parentEvent}
										<span class="italic">({event.parentEvent.title})</span>
									{/if}
								</p>
								<p class="text-xs text-muted-foreground">
									{formatDateDayAndMonth(event.createdAt)}
								</p>
							</div>
							<div class="mt-3 flex items-center gap-xxs text-muted-foreground">
								<ShapeAvatarSvg
									size={15}
									seed={event.organizers.find((o) => o.role === 'host')?.organization.name!}
								/>
								<p class={`w-fit text-start text-xs font-semibold text-muted-foreground`}>
									{event.organizers.find((o) => o.role === 'host')?.organization.name}
								</p>
							</div>
							<div class="mt-xxs flex items-center gap-xxs text-muted-foreground">
								<Calendar size="15" />
								<p class="text-xs">{formatDate(event.startsAt)}</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
		{#if pendingInvitations.state === 'pending' || pendingInvitations.state === 'failed'}
			<p>{pendingInvitations.message}</p>
		{:else if pendingInvitations.data.length > 0}
			<div class="flex flex-col gap-y-xs">
				<p class="text-xs text-muted-foreground uppercase">Invitations</p>
				{#each pendingInvitations.data as invitation}
					<a href={`/invitations/${invitation.id}`} class="no-underline">
						<div
							class="flex min-w-56 flex-col gap-0.5 rounded border bg-background p-xs hover:bg-muted"
						>
							<div class="flex items-start justify-between gap-x-0.5">
								<div class="flex items-center gap-x-1">
									<p class={`text-xs`}>
										{invitation.recipientOrganization.name}
									</p>
								</div>
								<p class="text-xs text-muted-foreground">
									{formatDateDayAndMonth(invitation.invitedAt)}
								</p>
							</div>
							<div class="mt-xxs flex items-center gap-x-xxs">
								<ShapeAvatarSvg class="rounded-sm" seed={invitation.sender.organization.name} />
								<div class="flex flex-col">
									<p class="text-sm font-bold text-foreground">
										{invitation.event.title}
									</p>
									<p class={`text-sm text-muted-foreground`}>
										{invitation.sender.organization.name}
									</p>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
	<!-- <EventCalendar /> -->
</div>
