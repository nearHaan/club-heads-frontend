<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import {
		BadgeQuestionMark,
		ChevronDown,
		CircleSlash,
		GitMerge,
		Link,
		Loader,
		Plus,
		Save,
		Skull,
		TriangleAlert,
		Unlink
	} from '@lucide/svelte';
	import type {
		CreateEventData,
		EventCategory,
		EventType,
		LoadedData,
		Organization,
		ParentableEvent
	} from '$lib/types';

	import { onMount } from 'svelte';
	import { loadOrgs } from '$lib/api/organizations';
	import { loadEventTypes } from '$lib/api/event-types';
	import { loadEventCategories } from '$lib/api/event-categories';
	import { createEvent, loadParentableEvents } from '$lib/api/events';
	import { authInfo } from '$lib/global/auth.svelte';
	import { goto } from '$app/navigation';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import { nav } from '../../header.svelte';
	import * as Popover from '$lib/components/ui/popover/index';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { loadEventCreatableOrganizations } from '$lib/api/me/me';
	import DatePicker from '$lib/components/app/date-picker.svelte';
	import type { CalendarDate } from '@internationalized/date';
	import TimePicker from '$lib/components/app/time-picker.svelte';
	import ParentEventSelectionPopup from './parent-event-selection-popup.svelte';

	let organizationId = $state<number | null>(null);
	let title = $state('');
	let expectedParticipants = $state<number>(0);
	let requestDetails = $state('');
	let startDate: CalendarDate | undefined = $state(undefined);
	let startTime: string = $state('10:00:00');
	let endDate: CalendarDate | undefined = $state(undefined);
	let endTime: string = $state('10:00:00');
	let activeEventType: EventType | null = $state(null);
	let activeEventCategory: EventCategory | null = $state(null);
	let parentEventsPopupOpen = $state(false);
	let selectedParentEvent: ParentableEvent | null = $state(null);

	let eventCreatableOrganizations = $state<LoadedData<{ id: number; name: string }[]>>({
		state: 'pending',
		message: 'Loading organizations...'
	});
	let eventTypes = $state<LoadedData<EventType[]>>({
		state: 'pending',
		message: 'Loading event types...'
	});
	let eventCategories = $state<LoadedData<EventCategory[]>>({
		state: 'pending',
		message: 'Loading event categories...'
	});

	onMount(async () => {
		nav.set([
			{ title: 'Events', url: '/events' },
			{ title: 'New event', url: '/events/new' }
		]);

		try {
			eventTypes = {
				state: 'success',
				data: await loadEventTypes()
			};
		} catch (err) {
			eventTypes = {
				state: 'failed',
				message: 'Failed to load event types'
			};
		}
		try {
			eventCategories = {
				state: 'success',
				data: await loadEventCategories()
			};
		} catch (err) {
			eventCategories = {
				state: 'failed',
				message: 'Failed to load event categories'
			};
		}
	});

	$effect(() => {
		(async () => {
			try {
				eventCreatableOrganizations = {
					state: 'success',
					data: await loadEventCreatableOrganizations()
				};
				if (eventCreatableOrganizations.data.length > 0) {
					organizationId = eventCreatableOrganizations.data[0].id;
				}
			} catch (err: any) {
				eventCreatableOrganizations = {
					state: 'failed',
					message: err.message ?? 'Failed to load organizations'
				};
			}
		})();
	});

	let errorText = $state('');
	let submitLoading = $state(false);

	function toISOString(date: CalendarDate, time: string): string {
		return new Date(`${date.toString()}T${time}`).toISOString();
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (organizationId === null) {
			errorText = 'Please select an organization';
			return;
		}
		if (title === null || title.trim().length === 0) {
			errorText = 'Title cannot be empty';
			return;
		}
		if (startDate === undefined) {
			errorText = 'Please select a start date';
			return;
		}
		if (endDate === undefined) {
			errorText = 'Please select an end date';
			return;
		}
		if (expectedParticipants === null || isNaN(expectedParticipants) || expectedParticipants < 0) {
			errorText = 'Please enter a postive integer for Expected participants';
			return;
		}
		if (activeEventType === null) {
			errorText = 'Please select an event type';
			return;
		}
		if (activeEventCategory === null) {
			errorText = 'Please select an event category';
			return;
		}
		errorText = '';
		try {
			submitLoading = true;
			const newEvent: CreateEventData = {
				organizationId,
				categoryId: activeEventCategory.id,
				typeId: activeEventType.id,
				endsAt: toISOString(endDate!, endTime),
				startsAt: toISOString(startDate!, startTime),
				title,
				expectedParticipants,
				requestDetails: requestDetails.trim(),
				parentEventId: selectedParentEvent?.id
			};
			const { id } = await createEvent(newEvent);
			await goto(`${id}`);
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			submitLoading = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-prose">
	{#if errorText}
		<div class="sticky top-12 flex flex-col bg-red-100 px-r-pad py-1 text-sm shadow-xs">
			<p class="text-red-400">{errorText}</p>
		</div>
	{/if}
	<form onsubmit={handleSubmit} class="flex flex-col gap-6 p-r-pad text-base">
		<div class="flex flex-col gap-2.5">
			<Popover.Root>
				<Popover.Trigger
					disabled={eventCreatableOrganizations.state !== 'success'}
					class={buttonVariants({
						variant: 'outline',
						size: 'sm',
						class: 'w-fit px-2'
					})}
				>
					{#if eventCreatableOrganizations.state === 'success'}
						{@const activeOrganization = eventCreatableOrganizations.data.find(
							(o) => o.id === organizationId
						)}
						<ShapeAvatarSvg class="rounded" size={20} seed={activeOrganization?.name!} />
						{activeOrganization?.name}
					{:else}
						Loading...
					{/if}
				</Popover.Trigger>
				{#if eventCreatableOrganizations.state === 'success'}
					<Popover.Content class="p-1" align="start">
						<div class="items-start">
							{#each eventCreatableOrganizations.data as organization}
								<Popover.Close
									class={`w-full justify-start rounded-none border-none ${buttonVariants({ variant: 'outline', size: 'sm' })}`}
									onclick={() => {
										organizationId = organization.id;
									}}
								>
									<ShapeAvatarSvg size={20} seed={organization.name} />
									{organization.name}
								</Popover.Close>
							{/each}
						</div>
					</Popover.Content>
				{/if}
			</Popover.Root>
			<input
				bind:value={title}
				onchange={(e) => (title = e.currentTarget.value)}
				placeholder="Event Title"
				type="text"
				class="rounded border border-muted-foreground px-2 py-1 text-lg placeholder:text-muted-foreground"
			/>
		</div>
		<div class="flex gap-6 max-sm:flex-col">
			<div class="flex flex-col gap-1 text-sm max-sm:w-full">
				Start Date
				<div class="flex flex-col">
					<DatePicker bind:value={startDate} />
					<TimePicker bind:value={startTime} />
				</div>
			</div>
			<div class="flex flex-col gap-1 text-sm max-sm:w-full">
				End Date
				<div class="flex flex-col">
					<DatePicker bind:value={endDate} />
					<TimePicker bind:value={endTime} />
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-1 text-sm">
			Description
			<textarea
				bind:value={requestDetails}
				onchange={(e) => (requestDetails = e.currentTarget.value)}
				class="min-h-30 resize-none rounded border border-muted-foreground px-2 py-1 text-lg placeholder:text-muted-foreground"
			></textarea>
		</div>
		<div class="flex flex-col gap-1 text-sm">
			Expected Participants
			<div class="flex items-center justify-center gap-4 max-sm:py-2 sm:justify-start">
				<button
					onclick={() => {
						expectedParticipants =
							expectedParticipants - 1 >= 0 ? expectedParticipants - 1 : expectedParticipants;
					}}
					class="text-base font-semibold text-primary/50 sm:hidden">-1</button
				>
				<button
					onclick={() => {
						expectedParticipants =
							expectedParticipants - 10 >= 0 ? expectedParticipants - 10 : expectedParticipants;
					}}
					class="text-base font-semibold text-primary/80 sm:hidden">-10</button
				>
				<input
					bind:value={expectedParticipants}
					onchange={(e) => (expectedParticipants = Number(e.currentTarget.value))}
					min="0"
					type="number"
					class="w-20 rounded border border-muted-foreground px-2 py-1 text-lg placeholder:text-muted-foreground max-sm:no-spinner max-sm:text-center sm:w-48"
				/>
				<button
					onclick={() => {
						expectedParticipants += 10;
					}}
					class="text-base font-semibold text-primary/80 sm:hidden">+10</button
				>
				<button
					onclick={() => {
						expectedParticipants += 1;
					}}
					class="text-base font-semibold text-primary/50 sm:hidden">+1</button
				>
			</div>
		</div>
		<div class="flex flex-col gap-1 text-sm max-sm:w-full">
			Event Type
			<Popover.Root>
				<Popover.Trigger
					disabled={eventTypes.state !== 'success'}
					class={buttonVariants({
						variant: 'outline',
						size: 'sm',
						class: 'flex h-auto w-full flex-col items-start p-2 sm:w-min sm:min-w-48'
					})}
				>
					<div class="flex w-full justify-between gap-2.5">
						<div class="flex flex-col items-start gap-1">
							{#if activeEventType !== null}
								<p class="text-base">{activeEventType.name}</p>
								<div class="flex gap-2.5 text-xs text-muted-foreground">
									<div class="flex items-center gap-1">
										{#if activeEventType.venuePolicy === 'optional'}
											<BadgeQuestionMark />
										{:else if activeEventType.venuePolicy === 'forbidden'}
											<Skull />
										{:else}
											<TriangleAlert />
										{/if}
										Venues
									</div>
									<div class="flex items-center gap-1">
										{#if activeEventType.collaborationPolicy === 'optional'}
											<BadgeQuestionMark />
										{:else if activeEventType.collaborationPolicy === 'forbidden'}
											<Skull />
										{:else}
											<TriangleAlert />
										{/if}
										Collaboration
									</div>
								</div>
							{:else}
								Select Type
							{/if}
						</div>
						<ChevronDown size="15" />
					</div>
				</Popover.Trigger>
				{#if eventTypes.state === 'success'}
					<Popover.Content class="p-1" align="start">
						{#each eventTypes.data as eventType}
							<Popover.Close
								class={buttonVariants({
									variant: 'outline',
									size: 'sm',
									class: [
										'flex h-auto w-full flex-col items-start p-2',
										activeEventType?.id === eventType.id ? 'border-primary/20 bg-primary/10' : ''
									]
								})}
								onclick={() => {
									activeEventType = eventType;
								}}
							>
								<div class="flex flex-col items-start gap-1">
									<p class="text-base">{eventType.name}</p>
									<div class="flex justify-start gap-2.5 text-xs text-muted-foreground">
										<div class="flex items-center gap-1">
											{#if eventType.venuePolicy === 'optional'}
												<BadgeQuestionMark />
											{:else if eventType.venuePolicy === 'forbidden'}
												<Skull />
											{:else}
												<TriangleAlert />
											{/if}
											Venues
										</div>
										<div class="flex items-center gap-1">
											{#if eventType.collaborationPolicy === 'optional'}
												<BadgeQuestionMark />
											{:else if eventType.collaborationPolicy === 'forbidden'}
												<Skull />
											{:else}
												<TriangleAlert />
											{/if}
											Collaboration
										</div>
									</div>
								</div>
							</Popover.Close>
						{/each}
					</Popover.Content>
				{/if}
			</Popover.Root>
		</div>
		<div class="flex flex-col gap-1 text-sm max-sm:w-full">
			Event Category
			<Popover.Root>
				<Popover.Trigger
					disabled={eventCategories.state !== 'success'}
					class={buttonVariants({
						variant: 'outline',
						size: 'sm',
						class: 'flex h-auto w-full flex-col items-start p-2 sm:w-48'
					})}
				>
					<div class="flex w-full items-center justify-between gap-2.5">
						<div class="flex flex-col items-start gap-1">
							{#if activeEventCategory !== null}
								<p class="text-base">{activeEventCategory.name}</p>
							{:else}
								Select Category
							{/if}
						</div>
						<ChevronDown size="15" />
					</div>
				</Popover.Trigger>
				{#if eventCategories.state === 'success'}
					<Popover.Content class="p-1" align="start">
						{#each eventCategories.data as category}
							<Popover.Close
								class={buttonVariants({
									variant: 'outline',
									size: 'sm',
									class: [
										'flex h-auto w-full flex-col items-start p-2',
										activeEventCategory?.id === category.id ? 'border-primary/20 bg-primary/10' : ''
									]
								})}
								onclick={() => {
									activeEventCategory = category;
								}}
							>
								<p class="text-base">{category.name}</p>
							</Popover.Close>
						{/each}
					</Popover.Content>
				{/if}
			</Popover.Root>
		</div>
		<div class="flex flex-col gap-1 text-sm max-sm:w-full">
			{#if selectedParentEvent === null}
				<Button
					disabled={organizationId === null || activeEventType === null}
					size="sm"
					variant="outline"
					class="w-min text-primary"
					onclick={() => {
						parentEventsPopupOpen = true;
					}}
				>
					<Link /> Link this to a parent event
				</Button>
				{#if organizationId === null || activeEventType === null}
					<p class="text-xs text-muted-foreground">
						Select an event type to make this event part of another event
					</p>
				{/if}
			{:else}
				<div class="flex gap-1.5 rounded-lg border bg-primary/10 p-2 shadow-xs">
					<div
						class="flex aspect-square h-10 items-center justify-center rounded-sm bg-primary/20 p-2"
					>
						<GitMerge size="15" />
					</div>
					<div class="flex flex-1 flex-col">
						<p class="text-xs text-muted-foreground">This Event is part of</p>
						<p class="text-lg font-semibold">{selectedParentEvent.title}</p>
					</div>
					<Button
						size="sm"
						variant="link"
						class="h-auto w-min cursor-pointer text-destructive hover:animate-pulse"
						onclick={() => {}}
					>
						<Unlink />
					</Button>
				</div>
			{/if}
		</div>
		{#if activeEventType !== null}
			<p class="text-sm text-muted-foreground">
				{#if activeEventType.venuePolicy === 'optional' && activeEventType.collaborationPolicy === 'optional'}
					Once the event is created, you can add venues and organizers while it's in draft. Submit
					the approval request whenever you're ready.
				{:else if activeEventType.venuePolicy === 'optional' && activeEventType.collaborationPolicy === 'required'}
					Once the event is created, you can add venues while it's in draft. Add at least one
					organizer before submitting the approval request.
				{:else if activeEventType.venuePolicy === 'optional' && activeEventType.collaborationPolicy === 'forbidden'}
					You can add venues while the event is in draft. Organizers are not supported for this type
					of event.
				{:else if activeEventType.venuePolicy === 'required' && activeEventType.collaborationPolicy === 'optional'}
					Once the event is created, you can add organizers while it's in draft. Add at least one
					venue before submitting the approval request.
				{:else if activeEventType.venuePolicy === 'required' && activeEventType.collaborationPolicy === 'required'}
					Once the event is created, add at least one venue and one organizer while the event is in
					draft before submitting the approval request.
				{:else if activeEventType.venuePolicy === 'required' && activeEventType.collaborationPolicy === 'forbidden'}
					Organizers are not supported for this type of event. Add at least one venue while the
					event is in draft before submitting the approval request.
				{:else if activeEventType.venuePolicy === 'forbidden' && activeEventType.collaborationPolicy === 'optional'}
					Venues are not supported for this type of event. Once the event is created, you can add
					organizers while it's in draft.
				{:else if activeEventType.venuePolicy === 'forbidden' && activeEventType.collaborationPolicy === 'required'}
					Venues are not supported for this type of event. Add at least one organizer while the
					event is in draft before submitting the approval request.
				{:else if activeEventType.venuePolicy === 'forbidden' && activeEventType.collaborationPolicy === 'forbidden'}
					Venues and organizers are not supported for this type of event. You can submit the
					approval request as soon as the event details are complete.
				{/if}
			</p>
		{/if}
		<div class="flex gap-2.5">
			<Button
				onclick={() => {
					goto('/events');
				}}
				size="sm"
				variant="outline"
				class="flex-1 text-destructive"
			>
				<CircleSlash /> Discard
			</Button>
			<Button disabled={submitLoading} size="sm" variant="default" class="flex-1" type="submit">
				{#if submitLoading}<Loader class="animate-spin" />
				{:else}<Save />
				{/if} Save
			</Button>
		</div>
	</form>
</div>

{#if parentEventsPopupOpen}
	<ParentEventSelectionPopup
		bind:isOpen={parentEventsPopupOpen}
		organizationId={organizationId!}
		eventTypeId={activeEventType?.id!}
		bind:selectedEvent={selectedParentEvent}
	/>
{/if}
