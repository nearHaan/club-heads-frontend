<script lang="ts">
	import { respondEventAssignments } from '$lib/api/me/approval-assignments';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { EventAssignmentsAndDetails, LoadedData } from '$lib/types';
	import { Check, ChevronDown, ChevronUp, Loader, SquareArrowRightExit } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		isOpen = $bindable(false),
		eventId,
		decision,
		eventAssignments = $bindable()
	}: {
		isOpen: boolean;
		eventId: number;
		decision: 'approved' | 'denied';
		eventAssignments: LoadedData<EventAssignmentsAndDetails>;
	} = $props();

	let remarks: string = $state('');
	let errorText = $state('');
	let loading = $state(false);
	let remarksStateWhenApproved = $state(false);

	async function respondToRequest() {
		if (eventAssignments.state !== 'success') return;
		if (decision === 'denied' && remarks.trim().length === 0) {
			errorText = 'Remarks required';
			return;
		}
		errorText = '';
		try {
			loading = true;
			await respondEventAssignments(eventId!, activeIds, decision, remarks);
			eventAssignments = {
				...eventAssignments,
				data: {
					...eventAssignments.data,
					assignments: eventAssignments.data.assignments.map((a) =>
						activeIds.includes(a.id) ? { ...a, status: decision, remarks: remarks.trim() } : a
					)
				}
			};
			isOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
			console.error(errorText);
		} finally {
			loading = false;
		}
	}
	let activeIds: number[] = $state([]);
	let rolesVisible = $state(false);

	$effect(() => {
		if (!isOpen) return;
		if (eventAssignments.state !== 'success') return;
		activeIds = eventAssignments.data.assignments
			.filter((a) => a.status === 'pending')
			.map((a) => a.id);
		rolesVisible = false;
	});
</script>

{#if eventAssignments.state === 'success'}
	<Dialog.Root bind:open={isOpen}>
		<Dialog.Content class="flex flex-col gap-2.5 overflow-hidden rounded-lg p-3 sm:max-w-lg">
			<p class="mt-1 text-sm text-muted-foreground">Confirm Approval</p>
			<div class="flex min-w-60 flex-col gap-2.5 py-2">
				<p class="text-sm leading-5">
					I <span class={`${decision === 'approved' ? 'text-green-600' : 'text-red-600'}`}
						>{decision === 'approved' ? 'approve' : 'deny'}</span
					>
					the request to conduct the event "<span class="font-semibold"
						>{eventAssignments.data.title}</span
					>" by
					<span class="font-semibold"
						>{eventAssignments.data.organizers.find((o) => o.role === 'host')?.organization
							.name}</span
					>
				</p>
				<button
					onclick={() => {
						rolesVisible = !rolesVisible;
					}}
					class="flex w-fit cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:underline"
					>Select roles <ChevronUp
						size="10"
						class={['transition-all ease-in-out', rolesVisible ? 'rotate-180' : 'rotate-0']}
					/></button
				>
				{#if rolesVisible}
					<div transition:slide class="h-min max-h-50 w-full overflow-auto">
						<div class="flex flex-col divide-y rounded-lg border">
							{#each eventAssignments.data.assignments.filter((a) => a.status === 'pending') as assignment}
								<div
									class="flex place-items-center justify-between gap-4 py-2 pr-2 pl-3 first:rounded-t-lg last:rounded-b-lg"
								>
									<div class="flex place-items-center gap-2.5">
										<input
											checked={activeIds.includes(assignment.id)}
											onchange={(e) => {
												if (e.currentTarget.checked) {
													activeIds = [...activeIds, assignment.id];
												} else {
													activeIds = activeIds.filter((id) => id !== assignment.id);
												}
											}}
											type="checkbox"
										/>
										<div class="text-xs">
											<p class="font-semibold">{assignment.role.name}</p>
											<p class="text-muted-foreground">
												{assignment.role.scope.kindName}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
				{#if decision === 'approved'}
					<div class="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
						<input
							bind:checked={remarksStateWhenApproved}
							onclick={(e) => {
								remarksStateWhenApproved = Boolean(e.currentTarget.checked);
							}}
							type="checkbox"
						/>
						<p>Add Remarks</p>
					</div>
				{/if}
				{#if (remarksStateWhenApproved && decision === 'approved') || decision === 'denied'}
					{#if errorText}
						<p class="text-xs text-red-500">{errorText}</p>
					{/if}
					<div transition:slide class="w-full">
						<p class={`text-xs text-muted-foreground `}>Remarks</p>
						<textarea
							bind:value={remarks}
							class={`min-h-20 w-full overflow-hidden rounded-sm bg-muted p-xxs ${errorText ? 'border border-red-400' : ''}}`}
						></textarea>
					</div>
				{/if}
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
					disabled={loading || activeIds.length === 0}
					size="sm"
					variant="default"
					class="flex-1"
					onclick={respondToRequest}
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
