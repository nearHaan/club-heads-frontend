<script lang="ts">
	import { abortEventWorkflow } from '$lib/api/events/workflow-instances';
	import { Button } from '$lib/components/ui/button';
	import { formatDate, formatDateDayAndMonth, formatDateOnlyTime } from '$lib/helpers';
	import type { LoadedData, WorkflowInstance } from '$lib/types';
	import {
		Check,
		ChevronDown,
		ChevronLast,
		CircleSlash,
		Clock,
		CopySlash,
		CornerDownRight,
		Dot,
		Loader,
		LoaderCircle,
		MessageCircle,
		MessageCircleMore,
		MessageSquareDot,
		MessageSquareQuote,
		Quote,
		ReceiptText,
		Skull,
		Workflow,
		X
	} from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let {
		eventId,
		activeWorkflow,
		trigReload = $bindable()
	}: {
		eventId: number;
		activeWorkflow: LoadedData<WorkflowInstance | null>;
		trigReload: {};
	} = $props();

	let showFullDetails = $state(false);

	function isStepPendingOrDenied(step: WorkflowInstance['steps'][0]) {
		return step.roles.some((role) =>
			role.targetGroups.some((group) =>
				group.assignments.some(
					(assignment) => assignment.status === 'pending' || assignment.status === 'denied'
				)
			)
		);
	}

	function viewFullDetails() {
		if (activeWorkflow.state !== 'success') return;
		if (activeWorkflow.data === null) return;
		showFullDetails = true;
		for (const step of activeWorkflow.data.steps) {
			step.stepOpen = true;
		}
	}

	function viewLessDetails() {
		if (activeWorkflow.state !== 'success') return;
		if (activeWorkflow.data === null) return;
		showFullDetails = false;
		for (const step of activeWorkflow.data.steps) {
			step.stepOpen = false;
		}
		openActiveStep();
	}

	function openActiveStep() {
		if (activeWorkflow.state !== 'success') return;
		if (activeWorkflow.data === null) return;

		let firstPendingFound = false;

		for (const step of activeWorkflow.data.steps) {
			if (!firstPendingFound && isStepPendingOrDenied(step)) {
				step.stepOpen = true;
				firstPendingFound = true;
			} else {
				step.stepOpen = false;
			}
		}
	}

	$effect(() => {
		openActiveStep();
	});

	let abortLoading = $state(false);

	async function abortWorkflow() {
		if (activeWorkflow.state !== 'success') return;
		try {
			abortLoading = true;
			await abortEventWorkflow(eventId, activeWorkflow.data?.id!);
			trigReload = { ...trigReload };
		} catch (err: any) {
			console.error(err.message ?? 'Failed to abort');
		} finally {
			abortLoading = false;
		}
	}
</script>

<div class="space-y-2">
	<div class="flex place-items-center justify-between">
		<p class="text-lg font-medium">Latest workflow</p>
	</div>

	{#if activeWorkflow.state === 'pending'}
		<p class="italic">Loading workflow...</p>
	{:else if activeWorkflow.state === 'failed'}
		<p class="text-red-400 italic">Failed to load workflow</p>
	{:else if activeWorkflow.state === 'success'}
		{#if activeWorkflow.data == null}
			<div class="rounded-lg border p-4 text-center text-xs text-muted-foreground">
				<p class="font-bold italic">No active workflow.</p>
				<p class="italic">Submit the event to start a workflow.</p>
			</div>
		{:else}
			<div class="space-y-3 rounded-lg border px-4 py-3">
				<div>
					<div class="font-medium">
						{#if activeWorkflow.data.status === 'active'}
							Awaiting approval
						{:else if activeWorkflow.data.status === 'aborted'}
							Aborted
						{:else if activeWorkflow.data.status === 'completed'}
							Completed!
						{:else if activeWorkflow.data.status === 'denied'}
							<span class="text-destructive">Request was denied</span>
						{:else if activeWorkflow.data.status === 'overridden'}
							Overidden
						{/if}
					</div>
					<div class="text-xs text-muted-foreground">
						{#if activeWorkflow.data.status !== 'active' && activeWorkflow.data.completedAt != null}
							Completed at {formatDate(activeWorkflow.data.completedAt)}
						{:else}
							Started at {formatDate(activeWorkflow.data.createdAt)}
						{/if}
					</div>
				</div>

				<div class="space-y-1">
					{#each activeWorkflow.data.steps as step}
						{@const assignments = step.roles.flatMap(({ targetGroups, ...role }) =>
							targetGroups.flatMap(({ assignments, ...targetGroup }) =>
								assignments.map((assignment) => ({
									group: targetGroup,
									stepRole: role,
									...assignment
								}))
							)
						)}

						{#if assignments.length > 0}
							{@const containsRemarks = assignments.some((a) => a.remarks)}
							<div class="flex gap-2"></div>

							<div>
								<button
									class="flex w-full place-items-center gap-2"
									onclick={() => {
										if (assignments.length === 0) return;
										step.stepOpen = !step.stepOpen;
									}}
								>
									<div
										class={[
											'aspect-square rounded-full p-1 text-background',
											step.status === 'completed'
												? 'bg-emerald-600'
												: step.status === 'denied' ||
													  step.status === 'blocked' ||
													  step.status === 'overridden'
													? 'bg-red-700'
													: step.status === 'skipped'
														? 'bg-neutral-300'
														: step.status === 'active'
															? 'bg-amber-300 text-foreground'
															: step.status === 'pending'
																? 'bg-background text-foreground'
																: 'bg-background text-foreground'
										]}
									>
										{#if step.status === 'completed'}
											<Check size="12" strokeWidth={3} />
										{:else if step.status === 'denied'}
											<X size="12" strokeWidth={3} />
										{:else if step.status === 'skipped'}
											<ChevronLast size="12" strokeWidth={3} />
										{:else if step.status === 'active'}
											<LoaderCircle class="animate-spin" size="12" strokeWidth={3} />
										{:else if step.status === 'pending'}
											<Clock size="12" strokeWidth={3} />
										{:else if step.status === 'blocked'}
											<CircleSlash size="12" strokeWidth={3} />
										{:else if step.status === 'overridden'}
											<CopySlash size="12" strokeWidth={3} />
										{:else}
											<Skull size="12" strokeWidth={3} />
										{/if}
									</div>

									<div class={['text-left', containsRemarks ? '' : 'grow']}>{step.name}</div>
									{#if containsRemarks}
										<div class="grow">
											<div class="aspect-square h-1 animate-pulse rounded-full bg-green-700"></div>
										</div>
									{/if}
									{#if assignments.length > 0}
										<ChevronDown
											size="16"
											class={[
												'transition-all duration-300',
												step.stepOpen ? 'rotate-180' : 'rotate-0'
											]}
										/>
									{/if}
								</button>

								{#if assignments.length > 0 && step.stepOpen}
									<div transition:slide class="mt-1 ml-2 border-l-2 border-dashed pl-5">
										<div class="divide-y">
											{#each assignments as assignment}
												<div class="flex place-items-start justify-between gap-2 py-1">
													<div class="w-full">
														<div class="flex justify-between gap-2">
															<div class="text-sm font-medium">
																{assignment.userRole.user.fullName}
															</div>

															<div
																class={[
																	'text-xs',
																	assignment.status === 'approved'
																		? 'font-semibold text-emerald-600'
																		: assignment.status === 'skipped'
																			? 'text-muted-foreground'
																			: assignment.status === 'denied'
																				? 'font-semibold text-red-700'
																				: assignment.status === 'pending'
																					? 'text-amber-400'
																					: ''
																]}
															>
																{assignment.status}
															</div>
														</div>
														<div class="flex flex-col text-xs">
															<div class="text-muted-foreground">
																{assignment.stepRole.role.name} &middot; {assignment.group.scope
																	.name}
															</div>
															{#if assignment.remarks}
																<div transition:slide class="flex gap-2 text-muted-foreground">
																	<div class="ml-1">
																		<div class="h-1 border-l border-muted-foreground"></div>
																		<div
																			class="h-3 w-2 rounded-bl-sm border-b border-l border-muted-foreground"
																		></div>
																	</div>
																	<div class="flex gap-0.5">
																		<Quote
																			class="mt-2 rotate-180 fill-muted-foreground text-transparent"
																			size={10}
																		/>
																		<div class="mt-2 w-fit text-sm text-foreground">
																			{assignment.remarks}
																		</div>
																		<Quote
																			class="mt-2 fill-muted-foreground text-transparent"
																			size={10}
																		/>
																	</div>
																</div>
															{/if}
															{#if assignment.completedAt && showFullDetails}
																<div
																	transition:slide
																	class="mt-2 text-[10px] text-muted-foreground/80"
																>
																	{formatDate(assignment.completedAt)}
																</div>
															{/if}
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
				<div class="text-xs text-muted-foreground">
					Submitted by <span class="text-foreground">{activeWorkflow.data.submitter.fullName}</span>
				</div>

				<div class="flex place-items-center justify-between">
					{#if activeWorkflow.data.status === 'active'}
						<Button
							disabled={abortLoading}
							onclick={abortWorkflow}
							size="sm"
							variant="outline"
							class="text-destructive"
						>
							{#if abortLoading}
								<Loader class="animate-spin" /> Aborting...
							{:else}
								<CircleSlash /> Abort
							{/if}
						</Button>
					{/if}

					<Button
						onclick={() => {
							if (showFullDetails === true) {
								viewLessDetails();
							} else {
								viewFullDetails();
							}
						}}
						size="sm"
						variant="ghost"
						class="ml-auto"
					>
						<ReceiptText />
						{#if showFullDetails}
							View less
						{:else}
							View details
						{/if}
					</Button>
				</div>
			</div>

			<Button href={`/events/${eventId}/workflows`} class="w-full rounded-sm" variant="outline">
				<Workflow /> See all workflows
			</Button>
		{/if}
	{/if}
</div>
