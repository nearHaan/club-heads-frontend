<script lang="ts">
	import { onMount } from 'svelte';
	import { nav } from '../header.svelte';
	import { getDaysInMonth } from '$lib/helpers';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const WEEK_DAYS_MAP: Record<number, string> = {
		0: 'SUN',
		1: 'MON',
		2: 'TUE',
		3: 'WED',
		4: 'THU',
		5: 'FRI',
		6: 'SAT'
	};
	const TIME_SLOT_TITLES = [
		'00:00',
		'01:00',
		'02:00',
		'03:00',
		'04:00',
		'05:00',
		'06:00',
		'07:00',
		'08:00',
		'09:00',
		'10:00',
		'11:00',
		'12:00',
		'13:00',
		'14:00',
		'15:00',
		'16:00',
		'17:00',
		'18:00',
		'19:00',
		'20:00',
		'21:00',
		'22:00',
		'23:00'
	];

	let days: {
		id: string;
		date: Date;
		dateDay: number;
	}[] = $state([]);

	let startingWeekDayIndex: number = $derived.by(() => {
		if (days.length == 0) return -1;
		return days[0].date.getDay();
	});

	onMount(() => {
		nav.set([{ title: 'Calendar', url: '/calendar' }]);
	});

	$effect(() => {
		const DATE_NOW = new Date(Date.now());
		const numOfDays = getDaysInMonth(DATE_NOW.getFullYear(), DATE_NOW.getMonth() + 1);
		days = Array.from({ length: numOfDays }, (_, i) => ({
			id: `${DATE_NOW.getFullYear()}-${DATE_NOW.getMonth()}-${i + 1}`,
			date: new Date(DATE_NOW.getFullYear(), DATE_NOW.getMonth(), i + 1),
			dateDay: i + 1
		}));
	});
</script>

<div class="mx-auto flex h-full w-full max-w-prose flex-col">
	<p class="p-xs text-lg">12 July - 18 July</p>
	<div class="no-scrollbar flex gap-xs overflow-auto border-y p-xs">
		{#each days as day, i}
			<button
				class="gay flex cursor-pointer flex-col items-center gap-0.5 rounded-sm border px-xs py-xxs"
			>
				<p class="text-xs text-muted-foreground">{WEEK_DAYS_MAP[(startingWeekDayIndex + i) % 7]}</p>
				<p class="text-lg font-semibold">{day.dateDay}</p>
			</button>
		{/each}
	</div>
	<div class="no-scrollbar w-full flex-1 gap-xs overflow-auto p-xs">
		{#each TIME_SLOT_TITLES as timeSlot}
			<div class="flex h-20 text-xs text-muted-foreground">
				<div class="w-10">{timeSlot}</div>
				<div class="flex-1 items-center gap-xs">
					<Separator class="mt-2" />
					<div class="flex w-full flex-1">
						<div
							style:height={`${80 * 0.5}px`}
							class="w-full rounded-sm bg-red-400 p-xs text-background"
						>
							Hello
						</div>
						<div
							style:height={`${80 * 1}px`}
							class="w-full rounded-sm bg-blue-400 p-xs text-background"
						>
							Hello
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
