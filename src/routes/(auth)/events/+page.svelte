<script lang="ts">
	import type { Event, LoadedData } from '$lib/types';
	import { Calendar, Funnel, Plus } from '@lucide/svelte';

	import { loadEvents } from '$lib/api/events';
	import SearchInput from '$lib/components/app/search-input.svelte';
	import ShapeAvatarSvg from '$lib/components/app/shape-avatar-svg.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { formatDateDayAndMonthAndYear, permissionGrantedSomewhere } from '$lib/helpers';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { nav } from '../header.svelte';

	let events = $state<LoadedData<Event[]>>({
		state: 'pending',
		message: 'Loading events...'
	});

	let searchValue = $state('');

	type EventGroupType = 'upcoming' | 'drafts' | 'pending' | 'cancelled' | 'past';
	const GROUP_DETAILS: {
		[k in EventGroupType]: {
			type: k;
			title: string;
			enabled: boolean;
			expanded: boolean;
		};
	} = $state({
		upcoming: {
			type: 'upcoming',
			title: 'Upcoming & Ongoing',
			enabled: true,
			expanded: true
		},
		drafts: {
			type: 'drafts',
			title: 'Drafts',
			enabled: true,
			expanded: true
		},
		pending: {
			type: 'pending',
			title: 'Awaiting Approval',
			enabled: true,
			expanded: true
		},
		past: {
			type: 'past',
			title: 'Past',
			enabled: true,
			expanded: false
		},
		cancelled: {
			type: 'cancelled',
			title: 'Cancelled & Overridden',
			enabled: true,
			expanded: false
		}
	});

	let grouped = $derived.by<Record<EventGroupType, Event[]>>(() => {
		const grouped = {
			upcoming: [],
			drafts: [],
			pending: [],
			past: [],
			cancelled: []
		} as Record<EventGroupType, Event[]>;

		if (events.state !== 'success') return grouped;

		const filtered = events.data.filter((e) =>
			e.title.toLowerCase().includes(searchValue.toLowerCase())
		);

		return filtered.reduce((grouped, event) => {
			if (event.status === 'draft') grouped.drafts.push(event);
			else if (event.status === 'pending') grouped.pending.push(event);
			else if (event.status === 'cancelled' || event.status === 'overridden') {
				// if (new Date() > new Date(event.startsAt)) {
				// grouped.archived.push(event);
				// } else {
				grouped.cancelled.push(event);
				// }
			} else if (event.status === 'approved') {
				if (new Date() > new Date(event.endsAt)) {
					grouped.past.push(event);
				} else {
					grouped.upcoming.push(event);
				}
			} else {
				console.error('Unable to group some events');
				console.log(event);
			}

			return grouped;
		}, grouped);
	});

	let eventsCount = $derived(Object.values(grouped).flat().length);

	onMount(() => {
		nav.set([{ title: 'Events', url: '/events' }]);
	});

	$effect(() => {
		(async () => {
			try {
				events = {
					state: 'success',
					data: await loadEvents()
				};
			} catch (error) {
				events = {
					state: 'failed',
					message: error instanceof Error ? error.message : 'Failed to load events'
				};
			}
		})();
	});

	export function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString('en-IN', {
			day: '2-digit',
			month: 'short'
		});
	}

	let canCreateEvent = $derived(permissionGrantedSomewhere('event:manage'));
</script>

<div class="mx-auto flex w-full max-w-prose flex-col">
	<div class="sticky top-12 z-40 flex gap-xs bg-background p-3">
		<div class="flex w-full place-items-center gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon" class="relative size-8 p-0">
							<Funnel />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<div class="p-3">
						<div>
							<div class="mb-2 font-medium">Status</div>
							<div>
								{#each Object.values(GROUP_DETAILS) as group}
									<div class="flex place-items-center gap-2 text-sm">
										<Checkbox bind:checked={group.enabled} id={group.type} />
										<label for={group.type}>{group.title}</label>
										{#if events.state === 'success'}
											<span class="text-xs text-muted-foreground" transition:slide={{ axis: 'x' }}>
												{grouped[group.type].length}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<SearchInput bind:value={searchValue} placeholder="Find events..." />
			{#if canCreateEvent}
				<Button href="/events/new">
					<Plus /> New
				</Button>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-y-8 p-r-pad">
		{#if events.state === 'pending' || events.state === 'failed'}
			<div class="grid animate-pulse grid-cols-2 gap-2">
				{#each Array.from({ length: 6 }) as _}
					<div
						class=" min-h-32 animate-pulse rounded-md border bg-neutral-200/80 sm:min-w-56"
					></div>
				{/each}
			</div>
		{:else if events.state === 'success'}
			{#if eventsCount === 0}
				<div>No events found</div>
			{:else}
				<div class="space-y-4">
					{#each Object.values(GROUP_DETAILS) as group}
						{@const events = grouped[group.type]}
						{#if events.length > 0 && group.enabled}
							<div>
								<div class="mb-2 text-xs text-muted-foreground uppercase">
									{group.title}
								</div>
								<div
									tabindex="-1"
									class="no-scrollbar grid max-w-full grid-cols-2 gap-2 overflow-x-scroll p-2"
								>
									{#each events as event}
										{@const hostOrganizer = event.organizers.find(
											(organizer) => organizer.role === 'host'
										)}
										{@const mainOrganizer = hostOrganizer ?? event.organizers[0]}
										<a
											class={[
												'flex min-h-32 cursor-pointer flex-col items-center justify-between overflow-hidden rounded-md border transition-all duration-150 hover:bg-foreground/5 sm:min-w-56',
												'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
											]}
											href="/events/{event.id}"
										>
											<div
												class={[
													'h-1 w-full rounded-t-lg',
													group.type === 'upcoming'
														? 'bg-emerald-200'
														: group.type === 'drafts'
															? 'bg-amber-200'
															: group.type === 'pending'
																? 'bg-blue-300'
																: group.type === 'cancelled'
																	? 'bg-red-400'
																	: group.type === 'past'
																		? 'bg-neutral-400'
																		: ''
												]}
											></div>

											<div class="flex w-full flex-col justify-between gap-4 p-3">
												<div class="">
													<div class="text-xs text-muted-foreground">
														<span class="font-medium">{event.type.name}</span> &middot;
														<span>{event.category.name}</span>
													</div>
													<div class="font-semibold">{event.title}</div>
												</div>

												<div class="text-sm text-muted-foreground">
													<div class="flex place-items-center gap-2">
														<Calendar size="14" />
														{formatDateDayAndMonthAndYear(event.startsAt)}
													</div>
													{#if mainOrganizer != null}
														<div class="flex place-items-center gap-2">
															<ShapeAvatarSvg
																size={14}
																seed={mainOrganizer.organization.name}
																class="rounded-xs"
															/>

															<div>
																<span class="font-medium">{mainOrganizer.organization.name}</span>

																{#if event.organizers.length > 1}
																	+ {event.organizers.length - 1}
																{/if}
															</div>
														</div>
													{/if}
												</div>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
