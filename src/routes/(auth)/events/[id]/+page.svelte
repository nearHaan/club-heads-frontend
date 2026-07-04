<script lang="ts">
	import { page } from '$app/state';
	import { getEvent } from '$lib/api/events';
	import { getEventType } from '$lib/api/event-types';
	import type {
		EventDetail,
		LoadedData,
		EventType,
		EventOrganizerInvitation,
		Organization,
		WorkflowInstance
	} from '$lib/types';
	import OrganizersSection from './organizers/organizers-section.svelte';
	import VenuesSection from './venues/venues-section.svelte';
	import { loadOrganizerInvitations } from '$lib/api/events/organizer-invitations';
	import { loadOrgs } from '$lib/api/organizations';
	import OverviewSection from './overview/overview-section.svelte';
	import WorkflowsSection from './workflows/workflows-section.svelte';
	import { loadEventWorkflowsLatest } from '$lib/api/events/workflow-instances';
	import { submitEvent } from '$lib/api/events/events';
	import { CheckCircle, Edit, Loader, XCircle } from '@lucide/svelte';
	import { eventStatusColors, eventStatusTextColors } from '$lib/constants';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { nav } from '../../header.svelte';
	import EditEventSheet from './edit-event-sheet.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index';

	let event = $state<LoadedData<EventDetail>>({
		state: 'pending',
		message: 'Loading event...'
	});

	let eventType = $state<LoadedData<EventType>>({
		state: 'pending',
		message: 'Loading event type...'
	});

	let organizerInvitations = $state<LoadedData<EventOrganizerInvitation[]>>({
		state: 'pending',
		message: 'Loading irganizer invitations...'
	});

	let organizations = $state<LoadedData<Organization[]>>({
		state: 'pending',
		message: 'Loading organizations...'
	});

	let latestWorkflow = $state<LoadedData<WorkflowInstance | null>>({
		state: 'pending',
		message: 'Loading latest workflow...'
	});

	let errorText = $state('');
	let successText = $state('');
	let submitLoading = $state(false);

	async function onSubmitEvent() {
		successText = '';
		if (event.state !== 'success') return;
		try {
			errorText = '';
			submitLoading = true;
			await submitEvent(event.data.id);
			successText = 'Event Submitted';
			loadEventData();
			setTimeout(() => {
				successText = '';
			}, 4000);
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
			setTimeout(() => {
				errorText = '';
			}, 4000);
		} finally {
			submitLoading = false;
		}
	}

	async function loadEventData() {
		errorText = '';
		try {
			event = {
				state: 'success',
				data: await getEvent(Number(page.params.id!))
			};
			nav.set([
				{ title: 'Events', url: '/events' },
				{ title: event.data.title, url: `/events/${event.data.id}` }
			]);

			try {
				eventType = {
					state: 'success',
					data: await getEventType(event.data.type.id)
				};
				if (eventType.data.collaborationPolicy !== 'forbidden') {
					try {
						organizerInvitations = {
							state: 'success',
							data: await loadOrganizerInvitations(event.data.id)
						};
					} catch (err: any) {
						organizerInvitations = {
							state: 'failed',
							message: 'Failed to load invitations'
						};
					}
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
				}
				try {
					latestWorkflow = {
						state: 'success',
						data: await loadEventWorkflowsLatest(event.data.id)
					};
				} catch (err: any) {
					latestWorkflow = {
						state: 'failed',
						message: 'Failed to load latest workflow'
					};
				}
			} catch (err: any) {
				eventType = {
					state: 'failed',
					message: 'Failed to load event type '
				};
			}
		} catch (err) {
			event = {
				state: 'failed',
				message: 'Failed to load event'
			};
		}
	}

	$effect(() => {
		loadEventData();
	});

	let editSheetOpen = $state(false);
	let editBtnTooltipOpen = $state(false);
</script>

{#if event.state === 'pending'}
	<div class="p-r-pad">
		<p>{event.message}</p>
	</div>
{:else if event.state === 'failed'}
	<div class="p-r-pad">
		<p class="text-red-500">{event.message}</p>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-prose flex-col">
		<div class="flex w-full flex-col">
			<div class="sticky top-12 z-40 bg-background p-4 max-sm:border-b">
				<div class="flex w-full flex-col gap-xxs">
					<div class="flex items-start justify-between gap-xxs">
						<div class="flex items-center gap-0.5 text-sm text-muted-foreground">
							<p class="text-foreground">{event.data.type.name}</p>
							<p>&middot;</p>
							<p>{event.data.category.name}</p>
						</div>
						<p
							class={`px-xxs py-0.5 text-xs font-bold uppercase ${eventStatusTextColors[event.data.status]} ${eventStatusColors[event.data.status]}`}
						>
							{event.data.status}
						</p>
					</div>
					<div class="flex justify-between gap-xs">
						<h1>{event.data.title}</h1>
						<Tooltip.Provider
							delayDuration={0}
							disabled={!(event.state !== 'success' || event.data.status !== 'draft')}
						>
							<Tooltip.Root>
								<Tooltip.Trigger
									><Button
										disabled={event.state !== 'success' || event.data.status !== 'draft'}
										onclick={() => {
											editSheetOpen = true;
										}}
										variant="link">Edit <Edit /></Button
									></Tooltip.Trigger
								>
								<Tooltip.Content>
									<p>Can Edit only during draft stage</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				</div>
				{#if errorText || successText}
					<p
						class={`mt-xs w-full p-xxs ${errorText ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
					>
						{errorText ? errorText : successText}
					</p>
				{/if}
			</div>

			<div class="space-y-6 p-4">
				<OverviewSection event={event.data} />
				<OrganizersSection
					eventId={event.data.id}
					eventName={event.data.title}
					bind:organizerInvitations
					bind:organizers={event.data.organizers}
					{organizations}
				/>
				<VenuesSection eventId={event.data.id} bind:allotedVenues={event.data.venueAllotments} />
				<WorkflowsSection eventId={event.data.id} activeWorkflow={latestWorkflow} />

				<div class="flex w-full gap-xs max-sm:flex-col-reverse">
					<Button class="bg-red-600 text-white hover:bg-red-800 sm:flex-1">
						<XCircle size="15" /> Cancel Event
					</Button>
					{#if event.data.status !== 'pending'}
						<Button onclick={onSubmitEvent} class="sm:flex-1">
							{#if submitLoading}
								<Loader size="15" class="animate-spin" />
							{:else}
								<CheckCircle size="15" />
							{/if}
							Submit Event
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if event.state === 'success'}
	<EditEventSheet bind:sheetOpen={editSheetOpen} bind:event={event.data} />
{/if}
