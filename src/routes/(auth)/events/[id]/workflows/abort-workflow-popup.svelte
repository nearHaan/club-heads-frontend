<script lang="ts">
	import { abortEventWorkflow } from '$lib/api/events/workflow-instances';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Loader, SquareArrowRightExit, X } from '@lucide/svelte';

	let {
		isOpen = $bindable(false),
		eventId,
		workflowId,
		trigReload = $bindable()
	}: {
		isOpen: boolean;
		eventId: number;
		workflowId: number;
		trigReload: {};
	} = $props();

	let errorText = $state('');
	let loading = $state(false);

	async function abortWorkflow() {
		try {
			loading = true;
			await abortEventWorkflow(eventId, workflowId);
			trigReload = { ...trigReload };
			isOpen = false;
		} catch (err: any) {
			errorText = err.message ?? 'Failed to abort';
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="flex flex-col gap-2.5 overflow-hidden rounded-lg p-3 sm:max-w-lg">
		<p class="mt-1 text-sm text-muted-foreground">Confirm Abort</p>
		<div class="flex min-w-60 flex-col gap-2.5 py-2">
			<p class="text-sm leading-5">
				This action cannot be undone. Are you sure you want to abort the current workflow ?
			</p>
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
				disabled={loading}
				size="sm"
				variant="destructive"
				class="flex-1"
				onclick={abortWorkflow}
			>
				{#if loading}<Loader class="animate-spin" />
				{:else}
					<X />
				{/if}
				Abort
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
