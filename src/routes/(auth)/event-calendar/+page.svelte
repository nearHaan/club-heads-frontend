<script lang="ts">
	import { loadCalculatedCalendarEvents } from '$lib/api/me/me';
	import { loadVenues } from '$lib/api/venue';
	import DatePicker from '$lib/components/app/date-picker.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import Button from '$lib/components/ui/button/button.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import * as Popover from '$lib/components/ui/popover/index';
	import { MONTHS_SHORT } from '$lib/constants';
	import { formatDateDayAndMonth, formatDateOnlyTime } from '$lib/helpers';
	import type { CalendarEventsAndDate, EventOrganizer, LoadedData, Venue } from '$lib/types';
	import { getLocalTimeZone, toCalendarDate, CalendarDate } from '@internationalized/date';
	import { CalendarIcon, Check, Clock, X } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let venues = $state<LoadedData<Venue[]>>({
		state: 'pending',
		message: 'Loading venues...'
	});
	let upcomingEvents = $state<LoadedData<CalendarEventsAndDate[]>>({
		state: 'pending',
		message: 'Loading events...'
	});
	let possibleStatus: ('approved' | 'pending')[] = ['approved', 'pending'];
	let selectedEventAllAllotedVenues:
		| CalendarEventsAndDate['events'][0]['allVenueAllotments']
		| undefined = $state(undefined);
	let allVenueDialogOpen = $state(false);

	let datePopupOpen = $state(false);
	let statusPopupOpen = $state(false);
	let venuesPopupOpen = $state(false);

	const durationDays = [30, 60, 90];
	let selectedDaysDuration = $state(90);
	let selectedStatusList: ('approved' | 'pending')[] = $state(['approved', 'pending']);

	let selectedStartDate: CalendarDate | undefined = $state();
	let startDatePopupOpen = $state(false);

	let selectedVenue: Venue | undefined = $state(undefined);

	const date = new Date();
	date.setMonth(date.getMonth() - 2);
	selectedStartDate = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

	function getDateFromCalendarDate(date: CalendarDate) {
		return new Date(date.year, date.month - 1, date.day);
	}

	$effect(() => {
		(async () => {
			try {
				venues = {
					state: 'success',
					data: await loadVenues()
				};
			} catch (err: any) {
				venues = {
					state: 'failed',
					message: err.message ?? 'Failed to load venues'
				};
			}
		})();
	});

	$effect(() => {
		(async () => {
			upcomingEvents = {
				state: 'pending',
				message: 'Loading events...'
			};
			try {
				upcomingEvents = {
					state: 'success',
					data: await loadCalculatedCalendarEvents({
						next: selectedDaysDuration,
						start: getDateFromCalendarDate(selectedStartDate!),
						status: selectedStatusList,
						venueId: selectedVenue?.id
					})
				};
			} catch (err: any) {
				upcomingEvents = {
					state: 'failed',
					message: err.message ?? 'Failed to load events'
				};
			}
		})();
	});

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		const day = date.getDate();
		const month = MONTHS_SHORT[date.getMonth()];
		const year = date.getFullYear();
		return `${month} ${day}, ${year}`;
	}
</script>

<div class="mx-auto flex w-full max-w-prose flex-col">
	<div class="no-scrollbar flex w-full items-center gap-2 overflow-x-auto p-sm">
		<Popover.Root bind:open={datePopupOpen}>
			<Popover.Trigger
				class={buttonVariants({
					variant: 'outline',
					size: 'sm',
					class: 'w-fit px-2'
				})}
			>
				Date Range
			</Popover.Trigger>
			<Popover.Content
				class="w-60 space-y-3 overflow-hidden rounded-lg p-sm text-xs text-muted-foreground"
				align="start"
			>
				<div class="space-y-0.5">
					<div>Start from:</div>
					<Popover.Root bind:open={startDatePopupOpen}>
						<Popover.Trigger
							class={buttonVariants({
								variant: 'outline',
								size: 'sm',
								class: 'w-full justify-start px-2 text-foreground'
							})}
						>
							{selectedStartDate ? formatDate(selectedStartDate.toString()) : 'Select date'}
							<CalendarIcon />
						</Popover.Trigger>
						<Popover.Content class="w-auto overflow-hidden p-0" align="start">
							<Calendar
								type="single"
								bind:value={selectedStartDate}
								captionLayout="dropdown"
								onValueChange={() => {
									startDatePopupOpen = false;
								}}
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
				<div class="space-y-0.5">
					<div>For next</div>
					<Popover.Root>
						<Popover.Trigger
							class={buttonVariants({
								variant: 'outline',
								size: 'sm',
								class: 'w-full justify-start px-2 text-foreground'
							})}
						>
							{selectedDaysDuration} days
						</Popover.Trigger>
						<Popover.Content class="max-h-60 p-1" align="start">
							<div class="items-start">
								{#each durationDays as duration}
									<Popover.Close
										class={`w-full justify-start rounded-none border-none ${buttonVariants({ variant: 'outline', size: 'sm' })}`}
										onclick={() => {
											selectedDaysDuration = duration;
										}}
									>
										{duration} days
									</Popover.Close>
								{/each}
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>
			</Popover.Content>
		</Popover.Root>
		<Popover.Root bind:open={statusPopupOpen}>
			<Popover.Trigger
				class={buttonVariants({
					variant: 'outline',
					size: 'sm',
					class: 'w-fit items-center px-2'
				})}
			>
				Status
				{#if selectedStatusList.length > 0}
					<div
						class="flex aspect-square h-3 items-center justify-center rounded-full bg-primary p-1 text-[8px] text-background"
					>
						{selectedStatusList.length}
					</div>
				{/if}
			</Popover.Trigger>
			<Popover.Content class="w-60 overflow-hidden rounded-lg p-0" align="start">
				{#each possibleStatus as status}
					<Button
						variant="outline"
						size="sm"
						class={`w-full justify-start rounded-none border-none shadow-none`}
						onclick={() => {
							if (selectedStatusList.includes(status)) {
								selectedStatusList = selectedStatusList.filter((s) => s !== status);
							} else {
								selectedStatusList = [...selectedStatusList, status];
							}
						}}
					>
						<Check class={selectedStatusList.includes(status) ? '' : 'invisible'} />
						{status[0].toUpperCase() + status.slice(1)}
					</Button>
				{/each}
			</Popover.Content>
		</Popover.Root>
		{#if selectedVenue}
			<Button
				variant="outline"
				size="sm"
				class={'w-fit items-center bg-primary/10 px-2 text-primary'}
				onclick={() => {
					selectedVenue = undefined;
				}}
			>
				{selectedVenue.name}
				<X />
			</Button>
		{:else}
			<Popover.Root bind:open={venuesPopupOpen}>
				<Popover.Trigger
					class={buttonVariants({
						variant: 'outline',
						size: 'sm',
						class: 'w-fit items-center px-2'
					})}
				>
					Venues
					{#if selectedVenue === undefined}
						<div class="rounded-xs bg-primary/10 px-1 py-0.5 text-xs text-primary">All</div>
					{/if}
				</Popover.Trigger>
				<Popover.Content class="max-h-60 w-60 overflow-auto rounded-lg p-0" align="start">
					{#if venues.state === 'success'}
						{#each venues.data as venue}
							<Button
								variant="outline"
								size="sm"
								class={`w-full justify-start rounded-none border-none shadow-none`}
								onclick={() => {
									selectedVenue = venue;
								}}
							>
								{venue.name}
							</Button>
						{/each}
					{/if}
				</Popover.Content>
			</Popover.Root>
		{/if}
	</div>
	<div class="space-y-6 p-sm">
		<!-- <p class="text-lg">Upcoming Events</p> -->
		<div class="space-y-5">
			{#if upcomingEvents.state === 'pending'}
				<div class="animate-pulse">
					<div class="h-8 rounded-sm bg-neutral-200"></div>
					<div class="mb-sm h-12 rounded-sm bg-muted"></div>
					<div class="h-8 rounded-sm bg-neutral-200"></div>
					<div class="mb-sm h-12 rounded-sm bg-muted"></div>
				</div>
			{:else if upcomingEvents.state === 'success'}
				{#if upcomingEvents.data.length === 0}
					<div>No events found in the selected Date Range</div>
				{/if}
				{#each upcomingEvents.data as day}
					<div class="space-y-0.5">
						<p class="font-semibold">{formatDate(day.utcDate)}</p>
						<div>
							{#each day.events as event}
								<div
									class="border-x border-b p-2.5 text-base first:rounded-t-sm first:border-t last:rounded-b-sm"
								>
									<div class="mb-2 flex items-center justify-between">
										<div>
											<div class="flex w-fit items-center gap-0.5 text-xs text-muted-foreground">
												<ShapeAvatarSvg
													class="rounded-sm"
													size={15}
													seed={event.hostOrganization.name}
												/>
												<div class="text-xs">
													{event.hostOrganization.name}
												</div>
												{#if event.parentEvent}
													<div>&middot;</div>
													<div class="text-foreground">{event.parentEvent.title}</div>
												{/if}
											</div>
											<div class="">{event.title}</div>
										</div>
										{#if event.status === 'pending'}
											<div class="aspect-square rounded-full bg-amber-300 p-1 text-foreground">
												<Clock size="12" strokeWidth={3} />
											</div>
										{/if}
									</div>
									{#each event.venueAllotments as venue}
										<div class="flex gap-2.5 text-sm">
											<div class="text-muted-foreground">
												{formatDateOnlyTime(venue.startsAt)} - {formatDateOnlyTime(venue.endsAt)}
											</div>
											<div>{venue.venue.name}</div>
										</div>
									{/each}
									{#if event.allVenueAllotments.length > 0}
										<Button
											variant="secondary"
											size="sm"
											class="mt-1.5 h-auto p-1 text-xs text-primary hover:bg-primary/10"
											onclick={() => {
												selectedEventAllAllotedVenues = event.allVenueAllotments;
												allVenueDialogOpen = true;
											}}
										>
											+{event.allVenueAllotments.length} venue{event.allVenueAllotments.length > 1
												? 's'
												: ''}
										</Button>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<Dialog.Root bind:open={allVenueDialogOpen}>
	<Dialog.Content class="flex flex-col gap-2 overflow-hidden rounded-lg p-3 sm:max-w-lg">
		<evediv>All Venue Allotments</evediv>
		<div class="space-y-1">
			{#each selectedEventAllAllotedVenues as allotement}
				<div class="border-b py-sm text-sm last:border-0">
					<div class="text-base font-semibold">{allotement.venue.name}</div>
					<div class="flex w-full justify-between">
						<div class="flex flex-col items-start">
							<div>{formatDateDayAndMonth(allotement.startsAt)}</div>
							<div class="text-muted-foreground">{formatDateOnlyTime(allotement.startsAt)}</div>
						</div>
						<div class="flex flex-col items-end">
							<div>{formatDateDayAndMonth(allotement.endsAt)}</div>
							<div class="text-muted-foreground">{formatDateOnlyTime(allotement.endsAt)}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
