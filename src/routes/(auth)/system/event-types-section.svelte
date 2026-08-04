<script lang="ts">
	import {
		addEventTypeChild,
		createEventType,
		loadEventTypeChildren,
		loadEventTypes
	} from '$lib/api/event-types';
	import { loadWorkflowTemplate, loadWorkflowTemplates } from '$lib/api/workflow-templates';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import SideSheet from '$lib/components/app/side-sheet.svelte';
	import TabButton from '$lib/components/app/tab-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import type {
		EventType,
		EventTypeCollaborationPolicyType,
		EventTypeVenuePolicyType,
		LoadedData,
		WorkflowTemplate
	} from '$lib/types';
	import { EVENT_TYPE_COLLABORATION_POLICY, EVENT_TYPE_VENUE_POLICY } from '$lib/types';
	import { Blend, Loader, MapPin, PencilIcon, PlusIcon, TrashIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let eventTypes = $state<LoadedData<(EventType & { selectedChildId: number | null })[]>>({
		state: 'pending',
		message: 'Loading event types...'
	});
	let eventTypeChildren = $state<LoadedData<{ id: number; name: string }[]>>({
		state: 'pending',
		message: 'Loading children...'
	});

	let newTypeWorkflowId = $state<number | null>(null);
	let newTypeName: string = $state('');
	let newTypeVenuePolicy: EventTypeVenuePolicyType = $state('optional');
	let newTypeCollabPolicy: EventTypeCollaborationPolicyType = $state('optional');

	let errorText = $state('');

	let activeEventType: (EventType & { selectedChildId: number | null }) | null = $state(null);

	let workflows = $state<LoadedData<WorkflowTemplate[]>>({
		state: 'pending',
		message: 'Loading Workflows...'
	});

	let addEventTypeSheetOpen = $state(false);
	const selectedWorkflow = $derived(
		workflows.state === 'success'
			? workflows.data.find((w) => String(w.id) === String(newTypeWorkflowId))
			: undefined
	);

	let addEventTypeLoading = $state(false);
	let addEventTypeChildLoading = $state(false);

	async function onChildAdd(parentId: number, childId: number) {
		if (!parentId || !childId) return;
		if (eventTypes.state !== 'success') return;
		if (eventTypeChildren.state !== 'success') return;
		try {
			addEventTypeChildLoading = true;
			const { parentTypeId, childTypeId } = await addEventTypeChild(parentId, childId);
			eventTypeChildren = {
				state: 'success',
				data: [
					...eventTypeChildren.data,
					{ id: childTypeId, name: eventTypes.data.find((e) => e.id === childId)?.name! }
				]
			};
		} catch (err: any) {
			console.error(err.message ?? 'Something went wrong');
		} finally {
			addEventTypeChildLoading = false;
		}
	}

	$effect(() => {
		(async () => {
			if (activeEventType === null) return;
			eventTypeChildren = {
				state: 'pending',
				message: 'Loading children...'
			};
			try {
				eventTypeChildren = {
					state: 'success',
					data: await loadEventTypeChildren(activeEventType.id)
				};
			} catch (err: any) {
				eventTypeChildren = {
					state: 'failed',
					message: err.message ?? 'Failed to load'
				};
			}
		})();
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (newTypeName.trim() === '') {
			errorText = 'Enter a valid name';
			return;
		}
		if (newTypeWorkflowId === null) {
			errorText = 'Select a workflow template';
			return;
		}
		if (newTypeCollabPolicy === null) {
			errorText = 'Select a collaboration policy';
			return;
		}
		if (newTypeVenuePolicy === null) {
			errorText = 'Select a venue policy';
			return;
		}
		if (eventTypes.state !== 'success') return;
		if (workflows.state !== 'success') return;
		try {
			addEventTypeLoading = true;
			const newType = await createEventType(
				newTypeName,
				newTypeVenuePolicy,
				newTypeCollabPolicy,
				newTypeWorkflowId
			);
			if (eventTypes.state === 'success') {
				eventTypes.data = [
					...eventTypes.data,
					{
						id: newType.id,
						name: newTypeName,
						isActive: true,
						workflowTemplate: {
							id: newTypeWorkflowId,
							name: workflows.data.find((w) => w.id === newTypeWorkflowId)?.name!
						},
						venuePolicy: newTypeVenuePolicy as EventType['venuePolicy'],
						collaborationPolicy: newTypeCollabPolicy as EventType['collaborationPolicy'],
						selectedChildId: null
					}
				];
			}
			addEventTypeSheetOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			addEventTypeLoading = false;
		}
	}

	onMount(async () => {
		try {
			const data = await loadEventTypes();
			eventTypes = {
				state: 'success',
				data: data.map((t) => ({ ...t, selectedChildId: null }))
			};

			const workflowList = await loadWorkflowTemplates();

			workflows = {
				state: 'success',
				data: workflowList
			};

			workflowList.forEach(async (workflow, index) => {
				try {
					const fullWorkflow = await loadWorkflowTemplate(workflow.id);

					if (workflows.state !== 'success') return;

					workflows.data[index] = fullWorkflow;
					workflows = { ...workflows };
				} catch (err) {
					console.error(`Failed: ${workflow.id}`);
				}
			});
			if (workflows.data.length > 0) {
				newTypeWorkflowId = workflows.data[0].id;
			}
		} catch (error) {
			eventTypes = {
				state: 'failed',
				message: 'Failed to load event types'
			};
		}
	});
</script>

<div class="flex w-full max-w-200 flex-col gap-y-sm p-r-pad">
	<div>
		<h3>Event Types</h3>
		<p class="text-sm text-muted-foreground">
			Manage event types and their allowed child types. Select an item to manage its children.
		</p>
	</div>

	<div class="">
		{#if eventTypes.state === 'pending'}
			<div class="flex animate-pulse flex-col gap-0.5 rounded-sm">
				<div class="h-9 w-full rounded-t-sm bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full bg-muted"></div>
				<div class="h-9 w-full rounded-b-sm bg-muted"></div>
			</div>
		{:else if eventTypes.state === 'success'}
			{#each eventTypes.data as eventType}
				<!-- <button
					onclick={async () => {
						activeEventType = eventType;
					}}
					class={[
						'flex w-full cursor-pointer justify-start border-x border-b border-foreground px-sm py-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b hover:bg-muted hover:underline',
						activeEventType?.id == eventType.id
							? 'bg-primary/10 text-primary hover:bg-primary/20'
							: ''
					]}>{eventType.name}</button
				> -->
				<Button
					variant="outline"
					size="sm"
					class={[
						'flex h-auto w-full flex-col items-start rounded-none border-x border-t-0 border-b border-foreground p-2 first:rounded-t-sm first:border-t last:rounded-b-sm',
						activeEventType?.id === eventType.id
							? 'border-primary/20 bg-primary/10 hover:bg-primary/15'
							: ''
					]}
					onclick={() => {
						activeEventType = eventType;
					}}
				>
					<div class="flex w-full flex-col items-start gap-1">
						<div class="flex w-full items-center justify-between">
							<p class="text-base">{eventType.name}</p>
						</div>
						<div class="flex flex-col justify-start gap-1 text-xs text-muted-foreground">
							<div class="flex items-center gap-1">
								<MapPin />
								{#if eventType.venuePolicy === 'optional'}
									Venues are optional
								{:else if eventType.venuePolicy === 'forbidden'}
									Venues not supported
								{:else}At least one venue required
								{/if}
							</div>
							<div class="flex items-center gap-1">
								<Blend />
								{#if eventType.collaborationPolicy === 'optional'}
									Organizers are optional
								{:else if eventType.collaborationPolicy === 'forbidden'}
									Collaboration not supported
								{:else}
									At least one organizer required
								{/if}
							</div>
						</div>
					</div>
				</Button>
			{/each}
			<div
				class="flex w-full border-x border-b border-foreground p-xs text-sm first:rounded-t-sm first:border-t last:rounded-b-sm last:border-b max-sm:flex-col"
			>
				<Button
					onclick={() => {
						addEventTypeSheetOpen = true;
					}}
					variant="link"><PlusIcon /> Add</Button
				>
			</div>
		{:else}
			<p class="p-xs">Failed to Load: {eventTypes.message}</p>
		{/if}
	</div>
	{#if activeEventType !== null}
		<div class="rounded-sm border border-foreground">
			<h3 class="p-xs font-medium">{activeEventType?.name}</h3>
			<div class="flex gap-x-xxs">
				<TabButton onclick={() => {}} title="Children" isActive={true} />
			</div>
			<div class="border-t border-muted-foreground">
				{#if eventTypeChildren.state === 'pending'}
					<p class="p-xs">{eventTypeChildren.message}</p>
				{:else if eventTypeChildren.state === 'success'}
					{#each eventTypeChildren.data as role}
						<div
							class="flex w-full items-center justify-start rounded-none border-b border-b-muted-foreground px-sm text-sm text-secondary-foreground"
						>
							<p class="w-full">{role.name}</p>
							<Button
								onclick={() => {
									// selectedRole = role;
									// roleSheetOpen = true;
								}}
								size="icon"
								variant="ghost"><PencilIcon /></Button
							>
							<Button class="text-red-400" size="icon" variant="ghost"><TrashIcon /></Button>
						</div>
					{/each}
					<div class="flex w-full p-xs text-sm max-sm:flex-col">
						{#if eventTypes.state === 'success'}
							<SelectButton
								name="event types"
								class="w-full"
								itemsList={eventTypes.data.filter(
									(e) =>
										eventTypeChildren.state === 'success' &&
										e.id !== activeEventType?.id &&
										!eventTypeChildren.data.some((c) => c.id === e.id)
								)}
								optionName="name"
								optionValue="id"
								bind:value={activeEventType.selectedChildId}
							/>
						{/if}
						<Button
							disabled={addEventTypeChildLoading}
							variant="link"
							onclick={() => {
								onChildAdd(activeEventType!.id, activeEventType!.selectedChildId!);
							}}
							class="rounded-none"
							>{#if addEventTypeChildLoading}
								<Loader class="animate-spin" />
							{:else}
								<PlusIcon />
							{/if}Add</Button
						>
					</div>
				{:else}
					<p class="p-xs">Failed to Load: {eventTypeChildren.message}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<SideSheet
	title="Add Event Type"
	description="Enter the details of the new event type. Click save when you're done"
	{errorText}
	bind:sheetOpen={addEventTypeSheetOpen}
>
	<form onsubmit={handleSubmit} class="flex h-full flex-col gap-y-6">
		<div class="grid gap-2">
			<Label for="name" class="text-end">Name</Label>
			<Input
				class="primary-input"
				bind:value={newTypeName}
				onchange={(e) => (newTypeName = e.currentTarget.value)}
				name="name"
			/>
		</div>
		<div class="grid gap-2">
			<Label for="name" class="text-end">Workflow Template</Label>
			{#if workflows.state === 'pending'}
				<p>Loading Workflows...</p>
			{:else if workflows.state === 'success'}
				<SelectButton
					name="workflows"
					class="w-full"
					itemsList={workflows.data}
					optionName="name"
					optionValue="id"
					bind:value={newTypeWorkflowId}
				/>
			{/if}

			{#if selectedWorkflow}
				<div class="flex flex-col bg-muted p-xxs">
					<p class="mb-xs text-xs text-muted-foreground">Template Preview</p>
					{#if selectedWorkflow.steps.length === 0}
						<p class="italic">No steps found</p>
					{/if}
					{#each selectedWorkflow.steps as step, index}
						<div class="flex flex-col">
							{#if index !== 0}
								<div class="flex w-5 justify-center">
									<div class="h-3 w-px bg-muted-foreground"></div>
								</div>
							{/if}
							<div class="flex h-5 items-center">
								<div class="flex h-5 w-5 flex-col items-center">
									<div
										class={`w-px flex-1 bg-muted-foreground
									${index === 0 ? 'invisible' : ''}`}
									></div>
									<div class="h-3 w-3 rounded-full border border-muted-foreground"></div>
									<div
										class={`w-px flex-1 bg-muted-foreground
									${workflows.state === 'success' && index === workflows.data.find((w) => w.id === newTypeWorkflowId!)!.steps.length - 1 ? 'invisible' : ''}`}
									></div>
								</div>
								<p class="ml-xxs">{step.name}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="grid gap-2">
			<Label for="name" class="text-end">Collaboration Policy</Label>
			<SelectButton
				name="collaboration policy"
				class="w-full"
				itemsList={[...EVENT_TYPE_COLLABORATION_POLICY]}
				bind:value={newTypeCollabPolicy}
			/>
		</div>
		<div class="grid gap-2">
			<Label for="name" class="text-end">Venue Policy</Label>
			<SelectButton
				name="venue policy"
				class="w-full"
				itemsList={[...EVENT_TYPE_VENUE_POLICY]}
				bind:value={newTypeVenuePolicy}
			/>
		</div>
		<Sheet.Footer class="sticky bottom-0 bg-background p-0">
			<Button disabled={addEventTypeLoading} type="submit"
				>{#if addEventTypeLoading}
					<Loader class="animate-spin" />
				{/if} Save changes</Button
			>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
		</Sheet.Footer>
	</form>
</SideSheet>
