<script lang="ts">
	import { loadEventCategories } from '$lib/api/event-categories';
	import { loadEventTypes } from '$lib/api/event-types';
	import { createEvent } from '$lib/api/events';
	import DatePicker from '$lib/components/app/date-picker.svelte';
	import TimePicker from '$lib/components/app/time-picker.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover/index';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import type {
		CreateEventData,
		EventCategory,
		EventDetail,
		EventType,
		LoadedData,
		ParentableEvent,
		UpdateEventData
	} from '$lib/types';
	import { CalendarDate } from '@internationalized/date';
	import {
		BadgeQuestionMark,
		ChevronDown,
		CircleSlash,
		GitMerge,
		Link,
		Loader,
		Save,
		Skull,
		TriangleAlert,
		Unlink,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import ParentEventSelectionPopup from '../new/parent-event-selection-popup.svelte';
	import { updateEvent } from '$lib/api/events/events';

	let {
		sheetOpen = $bindable(),
		event = $bindable()
	}: {
		sheetOpen: boolean;
		event: EventDetail;
	} = $props();

	let organizationId = $state<number | null>(null);
	let title = $state('');
	let expectedParticipants = $state<number>(0);
	let requestDetails = $state('');
	let startDate: CalendarDate | undefined = $state(undefined);
	let startTime: string = $state('10:00');
	let endDate: CalendarDate | undefined = $state(undefined);
	let endTime: string = $state('10:00');
	let activeEventType: EventType | null = $state(null);
	let activeEventCategory: EventCategory | null = $state(null);
	let parentEventsPopupOpen = $state(false);
	let selectedParentEvent: ParentableEvent | null = $state(null);

	let eventTypes = $state<LoadedData<EventType[]>>({
		state: 'pending',
		message: 'Loading event types...'
	});
	let eventCategories = $state<LoadedData<EventCategory[]>>({
		state: 'pending',
		message: 'Loading event categories...'
	});

	function extractCalendarDate(dateStr: string): CalendarDate {
		const date = new Date(dateStr);
		return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
	}

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleString('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	onMount(async () => {
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

	let errorText = $state('');
	let submitLoading = $state(false);

	function toISOString(date: CalendarDate, time: string): string {
		return new Date(`${date.toString()}T${time}`).toISOString();
	}

	function toISOStringFromString(dateStr: string): string {
		return new Date(dateStr).toISOString();
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
			const updatedEvent: UpdateEventData = {
				categoryId: activeEventCategory.id,
				typeId: activeEventType.id,
				endsAt: toISOString(endDate!, endTime),
				startsAt: toISOString(startDate!, startTime),
				title,
				expectedParticipants,
				requestDetails: requestDetails.trim(),
				parentEventId: selectedParentEvent?.id
			};
			const { id } = await updateEvent(event.id, updatedEvent);
			event = {
				...event,
				category: activeEventCategory,
				type: activeEventType,
				endsAt: toISOString(endDate!, endTime),
				startsAt: toISOString(startDate!, startTime),
				title,
				expectedParticipants,
				requestDetails: requestDetails.trim(),
				parentEvent: selectedParentEvent
			};
			sheetOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			submitLoading = false;
		}
	}

	$effect(() => {
		if (eventTypes.state !== 'success') return;
		if (eventCategories.state !== 'success') return;
		if (sheetOpen) {
			errorText = '';
			organizationId = event.organizers.find((o) => o.role === 'host')?.organization.id!;
			title = event.title;
			startDate = extractCalendarDate(event.startsAt);
			startTime = formatTime(event.startsAt);
			endDate = extractCalendarDate(event.endsAt);
			endTime = formatTime(event.endsAt);
			requestDetails = event.requestDetails;
			expectedParticipants = event.expectedParticipants;
			selectedParentEvent = event.parentEvent;
			activeEventType = eventTypes.data.find((et) => et.id === event.type.id) ?? null;
			activeEventCategory = eventCategories.data.find((ec) => ec.id === event.category.id) ?? null;
		}
	});

	let hasChanged = $derived.by<boolean>(() => {
		if (!startDate || !endDate) return false;
		return (
			event.title !== title.trim() ||
			toISOStringFromString(event.startsAt) !== toISOString(startDate!, startTime) ||
			toISOStringFromString(event.endsAt) !== toISOString(endDate!, endTime) ||
			event.requestDetails !== requestDetails.trim() ||
			event.expectedParticipants !== expectedParticipants ||
			event.type.id !== activeEventType?.id ||
			event.category.id !== activeEventCategory?.id ||
			event.parentEvent?.id !== selectedParentEvent?.id
		);
	});
</script>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content
		class="flex h-screen w-full flex-col gap-y-0 overflow-auto sm:min-w-100"
		side="right"
	>
		<form onsubmit={handleSubmit} class="flex h-full flex-col">
			<Sheet.Header class="sticky top-0 flex flex-col bg-background">
				<h2>Edit Event</h2>
			</Sheet.Header>
			<div class="flex h-full flex-1 flex-col gap-6 p-r-pad text-base">
				{#if errorText}
					<div class="sticky top-12 flex flex-col bg-red-100 px-r-pad py-1 text-sm shadow-xs">
						<p class="text-red-400">{errorText}</p>
					</div>
				{/if}
				<input
					bind:value={title}
					onchange={(e) => (title = e.currentTarget.value)}
					placeholder="Event Title"
					type="text"
					class="rounded border border-muted-foreground px-2 py-1 text-lg placeholder:text-muted-foreground"
				/>
				<div class="flex gap-6">
					<div class="flex w-full flex-col gap-1 text-sm">
						Start Date
						<div class="flex flex-col">
							<DatePicker bind:value={startDate} class="sm:w-full" />
							<TimePicker bind:value={startTime} class="sm:w-full" />
						</div>
					</div>
					<div class="flex w-full flex-col gap-1 text-sm">
						End Date
						<div class="flex flex-col">
							<DatePicker bind:value={endDate} class="sm:w-full" />
							<TimePicker bind:value={endTime} class="sm:w-full" />
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
					<div class="flex items-center justify-center gap-4 py-2">
						<button
							type="button"
							onclick={() => {
								expectedParticipants =
									expectedParticipants - 1 >= 0 ? expectedParticipants - 1 : expectedParticipants;
							}}
							class="text-base font-semibold text-primary/50">-1</button
						>
						<button
							type="button"
							onclick={() => {
								expectedParticipants =
									expectedParticipants - 10 >= 0 ? expectedParticipants - 10 : expectedParticipants;
							}}
							class="text-base font-semibold text-primary/80">-10</button
						>
						<input
							bind:value={expectedParticipants}
							onchange={(e) => (expectedParticipants = Number(e.currentTarget.value))}
							min="0"
							type="number"
							class="no-spinner w-20 rounded border border-muted-foreground px-2 py-1 text-center text-lg placeholder:text-muted-foreground"
						/>
						<button
							type="button"
							onclick={() => {
								expectedParticipants += 10;
							}}
							class="text-base font-semibold text-primary/80">+10</button
						>
						<button
							type="button"
							onclick={() => {
								expectedParticipants += 1;
							}}
							class="text-base font-semibold text-primary/50">+1</button
						>
					</div>
				</div>
				<div class="flex w-full flex-col gap-1 text-sm">
					Event Type
					<Popover.Root>
						<Popover.Trigger
							disabled={eventTypes.state !== 'success'}
							class={buttonVariants({
								variant: 'outline',
								size: 'sm',
								class: 'flex h-auto w-full flex-col items-start p-2'
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
							<Popover.Content class="max-h-60 overflow-auto p-1" align="start">
								{#each eventTypes.data as eventType}
									<Popover.Close
										class={buttonVariants({
											variant: 'outline',
											size: 'sm',
											class: [
												'flex h-auto w-full flex-col items-start rounded-none p-2 first:rounded-t-sm last:rounded-b-sm',
												activeEventType?.id === eventType.id
													? 'border-primary/20 bg-primary/10'
													: ''
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
				<div class="flex w-full flex-col gap-1 text-sm">
					Event Category
					<Popover.Root>
						<Popover.Trigger
							disabled={eventCategories.state !== 'success'}
							class={buttonVariants({
								variant: 'outline',
								size: 'sm',
								class: 'flex h-auto w-full flex-col items-start p-2'
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
							<Popover.Content class="max-h-60 overflow-auto p-1" align="start">
								{#each eventCategories.data as category}
									<Popover.Close
										class={buttonVariants({
											variant: 'outline',
											size: 'sm',
											class: [
												'flex h-auto w-full flex-col items-start rounded-none p-2 first:rounded-t-sm last:rounded-b-sm',
												activeEventCategory?.id === category.id
													? 'border-primary/20 bg-primary/10'
													: ''
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
				<div class="flex w-full flex-col gap-1 text-sm">
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
								onclick={() => {
									selectedParentEvent = null;
								}}
							>
								<Unlink />
							</Button>
						</div>
					{/if}
				</div>
				{#if activeEventType !== null}
					<p class="text-sm text-muted-foreground">
						{#if activeEventType.venuePolicy === 'optional' && activeEventType.collaborationPolicy === 'optional'}
							Once the event is created, you can add venues and organizers while it's in draft.
							Submit the approval request whenever you're ready.
						{:else if activeEventType.venuePolicy === 'optional' && activeEventType.collaborationPolicy === 'required'}
							Once the event is created, you can add venues while it's in draft. Add at least one
							organizer before submitting the approval request.
						{:else if activeEventType.venuePolicy === 'optional' && activeEventType.collaborationPolicy === 'forbidden'}
							You can add venues while the event is in draft. Organizers are not supported for this
							type of event.
						{:else if activeEventType.venuePolicy === 'required' && activeEventType.collaborationPolicy === 'optional'}
							Once the event is created, you can add organizers while it's in draft. Add at least
							one venue before submitting the approval request.
						{:else if activeEventType.venuePolicy === 'required' && activeEventType.collaborationPolicy === 'required'}
							Once the event is created, add at least one venue and one organizer while the event is
							in draft before submitting the approval request.
						{:else if activeEventType.venuePolicy === 'required' && activeEventType.collaborationPolicy === 'forbidden'}
							Organizers are not supported for this type of event. Add at least one venue while the
							event is in draft before submitting the approval request.
						{:else if activeEventType.venuePolicy === 'forbidden' && activeEventType.collaborationPolicy === 'optional'}
							Venues are not supported for this type of event. Once the event is created, you can
							add organizers while it's in draft.
						{:else if activeEventType.venuePolicy === 'forbidden' && activeEventType.collaborationPolicy === 'required'}
							Venues are not supported for this type of event. Add at least one organizer while the
							event is in draft before submitting the approval request.
						{:else if activeEventType.venuePolicy === 'forbidden' && activeEventType.collaborationPolicy === 'forbidden'}
							Venues and organizers are not supported for this type of event. You can submit the
							approval request as soon as the event details are complete.
						{/if}
					</p>
				{/if}
				<div class="sticky bottom-0 flex flex-col gap-2.5 bg-background py-2.5">
					<Button
						disabled={submitLoading || !hasChanged}
						size="sm"
						variant="default"
						class="py-2.5"
						type="submit"
					>
						{#if submitLoading}<Loader class="animate-spin" />
						{:else}<Save />
						{/if}
						{'Save & close'}
					</Button>
					<Button
						onclick={() => {
							sheetOpen = false;
						}}
						size="sm"
						variant="outline"
						class={[
							'py-2.5',
							hasChanged ? 'bg-destructive text-background' : 'bg-background text-foreground'
						]}
					>
						{#if hasChanged}
							<CircleSlash />Discard & close
						{:else}
							<X />Close
						{/if}
					</Button>
				</div>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>

{#if parentEventsPopupOpen}
	<ParentEventSelectionPopup
		bind:isOpen={parentEventsPopupOpen}
		organizationId={organizationId!}
		eventTypeId={activeEventType?.id!}
		bind:selectedEvent={selectedParentEvent}
	/>
{/if}
