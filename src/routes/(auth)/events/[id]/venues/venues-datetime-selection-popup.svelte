<script lang="ts">
	import { allotEventVenue } from '$lib/api/events/venue-allotments';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { type EventDetail, type EventVenueAllotment, type Venue } from '$lib/types';
	import { Calendar, Clock, Loader } from '@lucide/svelte';

	let {
		eventId,
		event,
		isOpen = $bindable(false),
		selectedVenue = $bindable(),
		allotedVenues = $bindable()
	}: {
		eventId: number;
		event: EventDetail;
		isOpen: boolean;
		selectedVenue: null | Venue;
		allotedVenues: EventVenueAllotment[];
	} = $props();

	let addVenueLoading = $state(false);
	let errorText = $state('');

	// function extractCalendarDateTime(dateStr: string): CalendarDateTime {
	// 	const date = new Date(dateStr);
	// 	return new CalendarDateTime(
	// 		date.getFullYear(),
	// 		date.getMonth() + 1,
	// 		date.getDate(),
	// 		date.getHours(),
	// 		date.getMinutes(),
	// 		date.getSeconds(),
	// 		date.getMilliseconds()
	// 	);
	// }

	// let startDate: CalendarDate = $derived(toCalendarDate(extractCalendarDateTime(event.startsAt)));
	// let startTime: Time = $derived(toTime(extractCalendarDateTime(event.startsAt)));
	// let endDate: CalendarDate = $derived(toCalendarDate(extractCalendarDateTime(event.endsAt)));
	// let endTime: Time = $derived(toTime(extractCalendarDateTime(event.endsAt)));

	let newStartDate: string | undefined = $state(undefined);
	let newStartTime: string = $state('00:00:00');
	let newEndDate: string | undefined = $state(undefined);
	let newEndTime: string = $state('00:00:00');

	function toISOString(date: string, time: string): string {
		return new Date(`${date}T${time}`).toISOString();
	}

	async function onAllotVenue() {
		if (newStartDate === undefined) {
			errorText = 'Please enter a valid start date';
			return;
		}
		if (newStartTime === undefined) {
			errorText = 'Please enter a valid start time';
			return;
		}
		if (newEndDate === undefined) {
			errorText = 'Please enter a valid end date';
			return;
		}
		if (newEndTime === undefined) {
			errorText = 'Please enter a valid end time';
			return;
		}
		try {
			errorText = '';
			addVenueLoading = true;
			console.log(newStartDate);
			const startsAt = toISOString(newStartDate, newStartTime);
			const endsAt = toISOString(newEndDate, newEndTime);

			const { id } = await allotEventVenue(eventId, selectedVenue?.id!, startsAt, endsAt);
			allotedVenues.push({
				id: id,
				venue: {
					id: selectedVenue?.id!,
					name: selectedVenue?.name!
				},
				startsAt,
				endsAt
			});
			selectedVenue = null;
			isOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			addVenueLoading = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<form>
		<Dialog.Content class="flex flex-col overflow-hidden rounded sm:max-w-lg">
			<div class="flex flex-col gap-sm p-sm">
				<p class="mr-5 text-lg">Allot a new venue for the event</p>
				<div class="flex h-10 w-full items-center gap-x-xxs rounded bg-muted p-xxs">
					{selectedVenue?.name}
				</div>
				<div class="flex w-full flex-col justify-between gap-sm overflow-auto">
					<div class="flex flex-col items-start gap-xxs text-sm">
						<p class="">Start</p>
						<div class="flex w-full gap-0.5 rounded bg-muted max-sm:flex-col">
							<div
								class="flex w-full items-center gap-xxs p-xxs text-sm text-foreground max-sm:border-b sm:border-r-2"
							>
								<Calendar class="text-muted-foreground" size="20" />
								<input
									bind:value={newStartDate}
									onchange={(e) => (newStartDate = e.currentTarget.value)}
									class="focus:outline-none"
									type="date"
								/>
								<!-- <DatePicker bind:value={startDate} /> -->
							</div>
							<div class="flex w-full items-center gap-xxs p-xxs text-sm text-foreground">
								<Clock class="text-muted-foreground" size="20" />
								<input
									bind:value={newStartTime}
									onchange={(e) => (newStartTime = e.currentTarget.value)}
									class="focus:outline-none"
									type="time"
								/>
							</div>
						</div>
					</div>
					<div class="flex flex-col items-start gap-xxs text-sm">
						<p class="">End</p>
						<div class="flex w-full gap-0.5 rounded bg-muted max-sm:flex-col">
							<div
								class="flex w-full items-center gap-xxs p-xxs text-sm text-foreground max-sm:border-b sm:border-r-2"
							>
								<Calendar class="text-muted-foreground" size="20" />
								<input
									bind:value={newEndDate}
									onchange={(e) => (newEndDate = e.currentTarget.value)}
									class="focus:outline-none"
									type="date"
								/>
							</div>
							<div class="flex w-full items-center gap-xxs p-xxs text-sm text-foreground">
								<Clock class="text-muted-foreground" size="20" />
								<input
									bind:value={newEndTime}
									onchange={(e) => (newEndTime = e.currentTarget.value)}
									class="focus:outline-none"
									type="time"
								/>
							</div>
						</div>
					</div>
				</div>
				{#if errorText}
					<p class="text-xs text-red-700">{errorText}</p>
				{/if}
				<Button onclick={onAllotVenue}
					>{#if addVenueLoading}
						<Loader size="15" class="animate-spin" />
					{/if}Allot</Button
				>
			</div>
		</Dialog.Content>
	</form>
</Dialog.Root>
