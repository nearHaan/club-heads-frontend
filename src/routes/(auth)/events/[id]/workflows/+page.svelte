<script lang="ts">
	import { page } from '$app/state';
	import { loadEventWorkflow, loadEventWorkflows } from '$lib/api/events/workflow-instances';
	import { workflowStatusColors, workflowStatusTextColors } from '$lib/constants';
	import { formatDate, formatDateDayAndMonthAndYear, formatDateOnlyTime } from '$lib/helpers';
	import type { LoadedData, WorkflowInstance } from '$lib/types';
	import {
		Check,
		ChevronDown,
		ChevronLast,
		CircleSlash,
		Clock,
		CopySlash,
		LoaderCircle,
		PanelTopOpen,
		Quote,
		ReceiptText,
		Skull,
		X
	} from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import { nav } from '../../../header.svelte';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let workflows = $state<LoadedData<WorkflowInstance[]>>({
		state: 'pending',
		message: 'Loading workflows...'
	});

	let activeWorkflow = $state<LoadedData<WorkflowInstance>>({
		state: 'pending',
		message: 'Loading workflow...'
	});

	let activeWorkflowId: number | null = $state(null);
	let eventId = $derived(Number(page.params.id));

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
		if (activeWorkflow !== null) {
			viewFullDetails();
		}
	});

	$effect(() => {
		(async () => {
			try {
				nav.set([{ title: 'Workflow runs', url: `/events/${eventId}/workflows` }]);

				workflows = {
					state: 'success',
					data: await loadEventWorkflows(eventId)
				};
			} catch (err: any) {
				workflows = {
					state: 'failed',
					message: 'Failed to load workflows'
				};
			}
		})();
	});

	async function loadWorkflow(id: number) {
		activeWorkflow = {
			state: 'pending',
			message: 'Loading workflow...'
		};
		try {
			activeWorkflow = {
				state: 'success',
				data: await loadEventWorkflow(eventId, id)
			};
		} catch (err: any) {
			activeWorkflow = {
				state: 'failed',
				message: 'Failed to load workflow'
			};
		}
	}

	let expandWorkflows = $state(true);
</script>

<div class="absolute inset-x-0 top-12 bottom-0 mx-auto max-w-prose">
	<div class="relative flex h-full w-full flex-col gap-y-sm overflow-auto">
		{#if workflows.state === 'success'}
			{#if workflows.data.length > 0}
				<div transition:slide class="flex-1 space-y-sm p-r-pad">
					{#if activeWorkflow.state === 'pending'}
						<div class="mb-16 flex w-full animate-pulse flex-col gap-1 p-4">
							<div class="h-5 w-20 bg-neutral-200/90"></div>
							<div class="h-2 w-40 bg-neutral-200/80"></div>
							<div class="mt-8 h-10 w-full bg-neutral-200/80"></div>
							<div class="h-10 w-full bg-neutral-200/80"></div>
						</div>
					{:else if activeWorkflow.state === 'failed'}
						<p class="mb-16 text-red-400 italic">Failed to load workflow</p>
					{:else if activeWorkflow.state === 'success'}
						{#if activeWorkflow.data == null}
							<div class="mb-16 rounded-lg border p-4 text-center text-xs text-muted-foreground">
								<p class="font-bold italic">No active workflow.</p>
								<p class="italic">Submit the event to start a workflow.</p>
							</div>
						{:else}
							<div class="flex place-items-center justify-between">
								<p class="text-lg font-medium italic">Workflow #{activeWorkflow.data.id}</p>
								<Button
									onclick={() => {
										expandWorkflows = true;
									}}
									size="sm"
									variant="ghost"
								>
									<X />
								</Button>
							</div>
							<div class="mb-16 space-y-3 rounded-lg border px-4 py-3">
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

													<div class={['text-left', containsRemarks ? '' : 'grow']}>
														{step.name}
													</div>
													{#if containsRemarks}
														<div class="grow">
															<div
																class="aspect-square h-1 animate-pulse rounded-full bg-green-700"
															></div>
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
																				{assignment.stepRole.role.name} &middot; {assignment.group
																					.scope.name}
																			</div>
																			{#if assignment.remarks}
																				<div
																					transition:slide
																					class="flex gap-2 text-muted-foreground"
																				>
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
									Submitted by <span class="text-foreground"
										>{activeWorkflow.data.submitter.fullName}</span
									>
								</div>

								<div class="flex place-items-center justify-end">
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
						{/if}
					{/if}
				</div>
			{/if}
		{/if}
	</div>
	<div
		class={[
			'absolute inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-prose flex-col gap-sm rounded-t-2xl bg-background p-r-pad transition-all duration-700 ease-in-out',
			expandWorkflows
				? 'h-full'
				: 'h-min shadow-[0_-1px_1px_0_rgb(0_0_0/0.1)] duration-50 hover:translate-y-1 hover:scale-98'
		]}
	>
		<button
			onclick={() => {
				if (activeWorkflowId === null) return;
				expandWorkflows = !expandWorkflows;
			}}
			class="flex cursor-pointer place-items-center justify-between"
		>
			<p class="text-lg font-medium">All Workflows</p>
			{#if activeWorkflowId !== null}
				<div
					class={buttonVariants({
						variant: 'ghost',
						size: 'sm',
						class: ['transition-all', expandWorkflows ? 'rotate-0' : 'rotate-180']
					})}
				>
					<PanelTopOpen />
				</div>
			{/if}
		</button>
		{#if workflows.state !== 'success'}
			<div class="flex w-full animate-pulse flex-col gap-y-xs">
				<div class="h-25 w-full rounded-t-lg bg-neutral-200"></div>
				<div class="h-25 w-full bg-neutral-200"></div>
				<div class="h-25 w-full rounded-b-lg bg-neutral-200"></div>
			</div>
		{:else if expandWorkflows}
			<div transition:slide class="flex h-full flex-col gap-sm overflow-auto">
				<div class="text-sm text-muted-foreground">
					Select a workflow to view its complete details
				</div>
				<div class="no-scrollbar flex h-full flex-col text-sm">
					{#if workflows.data.length === 0}
						<div class="rounded-lg border p-4 text-center text-xs text-muted-foreground">
							<p class="font-bold italic">No active workflow.</p>
							<p class="italic">Submit the event to start a workflow.</p>
						</div>
					{/if}
					{#each workflows.data as workflow}
						<button
							disabled={workflow.id === activeWorkflowId}
							onclick={() => {
								if (workflow.id === activeWorkflowId) return;
								expandWorkflows = false;
								activeWorkflowId = workflow.id;
								loadWorkflow(activeWorkflowId);
							}}
							class={[
								'flex cursor-pointer flex-col items-start gap-y-xxs border-x border-b p-xs first:rounded-t-lg first:border-t last:rounded-b-lg',
								activeWorkflow.state === 'success' && activeWorkflow.data.id === workflow.id
									? 'bg-primary/10'
									: ''
							]}
						>
							<div class="flex w-full items-center justify-between">
								<p class="w-min text-lg text-primary underline">#{workflow.id}</p>
								<p class={`w-min ${workflowStatusTextColors[workflow.status]}`}>
									{workflow.status}
								</p>
							</div>
							<div class="flex w-full justify-between">
								<div class="flex flex-col items-start">
									<p class="text-xs text-muted-foreground">Created on</p>
									<p class="text-left font-semibold">
										{formatDateDayAndMonthAndYear(workflow.createdAt)}
									</p>
									<p class="text-left">{formatDateOnlyTime(workflow.createdAt)}</p>
								</div>
								<div class="flex flex-col items-end">
									<p class="text-xs text-muted-foreground">Completed on</p>
									{#if workflow.completedAt}
										<p class="text-left font-semibold">
											{formatDateDayAndMonthAndYear(workflow.completedAt)}
										</p>
										<p class="text-left">{formatDateOnlyTime(workflow.completedAt)}</p>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
