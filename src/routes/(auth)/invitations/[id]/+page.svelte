<script lang="ts">
	import { page } from '$app/state';
	import CenterLoader from '$lib/components/app/center-loader.svelte';
	import { formatDate, formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { LoadedData, PendingInvitationDetailed } from '$lib/types';
	import { onMount } from 'svelte';
	import Popup from './popup.svelte';
	import { Ban, Calendar, Check, CheckCircle, Ellipsis, X, XCircle } from '@lucide/svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { nav } from '../../header.svelte';
	import { loadPendingInvitation } from '$lib/api/me/invitations';

	let invitationId: number | null = $derived(Number(page.params.id) ?? null);

	let invitationEvent = $state<LoadedData<PendingInvitationDetailed>>({
		state: 'pending',
		message: 'Loading invitation...'
	});
	let decisionMade: 'accepted' | 'rejected' | null = $state(null);

	onMount(() => {
		nav.set([{ title: 'Invitations', url: '/invitations' }]);

		(async () => {
			if (!invitationId) return null;
			try {
				invitationEvent = {
					state: 'success',
					data: await loadPendingInvitation(Number(invitationId))
				};
			} catch (err: any) {
				invitationEvent = {
					state: 'failed',
					message: err.message ?? 'Failed to load invitation'
				};
			}
		})();
	});

	let descLength = $state(150);
	function onMoreClick() {
		descLength += 100;
	}

	let popupOpen = $state(false);
	let activeDecision: 'accepted' | 'rejected' | null = $state(null);
</script>

{#if invitationEvent.state === 'pending' || invitationEvent.state === 'failed'}
	<CenterLoader state={invitationEvent.state} message={invitationEvent.message} />
{:else}
	<div class="mx-auto flex w-full max-w-prose flex-col">
		<div class="flex items-center gap-x-xs border-b p-r-pad">
			<ShapeAvatarSvg styleName={'thumb'} seed={invitationEvent.data.sender.fullName} />
			<div class="flex flex-col">
				<p class="text-sm font-semibold">
					{invitationEvent.data.sender.fullName}
					<span class="text-xs font-normal text-muted-foreground">invited you</span>
				</p>
				<p class="text-xs text-primary">
					{invitationEvent.data.sender.organization.name}
				</p>
			</div>
		</div>
		<div class="sticky top-12 z-40 flex flex-col gap-xs bg-background p-r-pad">
			<div class="flex w-full flex-col items-start justify-between gap-xxs">
				<h1 class="text-2xl leading-none">
					{invitationEvent.data.event.title}
				</h1>
				<div class="flex gap-x-xxs text-xs">
					<p class="">{invitationEvent.data.event.type.name}</p>
					<p>&middot;</p>
					<p class=" text-muted-foreground">
						{invitationEvent.data.event.category.name}
					</p>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-8 p-r-pad">
			<div class="flex flex-col gap-6">
				{#if invitationEvent.data.event.parentEvent}
					<div class="flex w-full flex-col">
						<p class="text-xs text-muted-foreground">Parent Event</p>
						<p class="text-sm font-bold">{invitationEvent.data.event.parentEvent}</p>
					</div>
				{/if}
				<div class="flex w-full flex-col">
					<p class="leading-tight text-muted-foreground">
						{invitationEvent.data.event.requestDetails.slice(0, descLength).trim()}
						{#if invitationEvent.data.event.requestDetails.length > descLength}
							<span>
								<Button onclick={onMoreClick} variant="link" class="h-min p-0 text-xs"
									>Show more</Button
								>
							</span>
						{/if}
					</p>
				</div>
				<div class="flex gap-sm max-sm:flex-col">
					<div class="flex w-full flex-col">
						<p class="text-xs text-muted-foreground">Expected participants</p>
						<p class="text-lg leading-tight">{invitationEvent.data.event.expectedParticipants}</p>
					</div>
					<div class="flex w-full items-center justify-between">
						<div class="flex w-full flex-col">
							<p class="text-xs text-muted-foreground">Starts at</p>
							<p class="text-left text-lg leading-tight">
								{formatDateDayAndMonthAndYear(invitationEvent.data.event.startsAt)}
							</p>
							<p class="text-lg leading-tight">
								{formatDateOnlyTime(invitationEvent.data.event.startsAt)}
							</p>
						</div>
						<Ellipsis />
						<div class="flex w-full flex-col items-end">
							<p class="text-xs text-muted-foreground">Ends at</p>
							<p class="text-right text-lg leading-tight">
								{formatDateDayAndMonthAndYear(invitationEvent.data.event.endsAt)}
							</p>
							<p class="text-lg leading-tight">
								{formatDateOnlyTime(invitationEvent.data.event.endsAt)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex place-items-center justify-between">
					<p class="text-lg font-medium">Organizers</p>
				</div>

				<div class="flex grid-cols-2 flex-col divide-y rounded-lg border sm:grid sm:divide-y-0">
					{#each invitationEvent.data.event.organizers as o}
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
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="flex w-full gap-xs p-r-pad max-sm:flex-col-reverse">
			{#if decisionMade === null}
				<Button
					onclick={() => {
						activeDecision = 'rejected';
						popupOpen = true;
					}}
					class="cursor-pointer border border-foreground bg-background  text-foreground hover:bg-muted sm:flex-1"
					><Ban size="15" />Reject</Button
				>
				<Button
					onclick={() => {
						activeDecision = 'accepted';
						popupOpen = true;
					}}
					class="cursor-pointer bg-foreground text-background hover:bg-neutral-700 sm:flex-1"
					><CheckCircle size="15" />Accept</Button
				>
			{:else}
				<p
					class={`w-full rounded-sm p-sm text-sm ${decisionMade === 'accepted' ? 'bg-green-600 text-foreground' : 'bg-destructive/80 text-background'}`}
				>
					{decisionMade.charAt(0).toUpperCase() + decisionMade.slice(1)} the invitation
				</p>
			{/if}
		</div>
	</div>
{/if}

{#if invitationEvent.state === 'success'}
	<Popup
		bind:isOpen={popupOpen}
		{invitationId}
		bind:invitationDetailed={invitationEvent}
		decision={activeDecision!}
		bind:decisionMade
	/>
{/if}
