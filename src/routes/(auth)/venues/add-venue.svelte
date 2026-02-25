<script lang="ts">
	import { createVenue } from '$lib/api/venue';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let errorText = $state('');

	const status = [
		{ value: 'Public', label: 'Public' },
		{ value: 'Private', label: 'Private' }
	];
	let statusValue = $state(status[0]?.label ?? 'Public');
	const statusTriggerContent = $derived(
		status.find((s) => s.value === statusValue)?.label ?? 'Public'
	);

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);
            const name = formData.get('name') as string;
            const available = formData.get('available') as string;
            const max_capacity = formData.get('max_capacity') as string;
            const access = formData.get('status') as string;

			if (await createVenue(name, available, max_capacity, access)) {
				console.log('Venue Added');
				open = false;
			}
		} catch (err: any) {
			errorText = err.message;
		}
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="w-full sm:min-w-100" side="right">
		<form onsubmit={handleSubmit}>
			<div class="overflow-auto">
				<Sheet.Header>
					<Sheet.Title>Add Venue</Sheet.Title>
					<Sheet.Description>
						Enter the details of the new venue. Click save when you're done.
					</Sheet.Description>
				</Sheet.Header>
				<div class="grid flex-1 auto-rows-min gap-6 px-4">
					{#if errorText}
						<p class="text-sm text-red-500">{errorText}</p>
					{/if}
					<div class="grid gap-3">
						<Label for="name" class="text-end">Name</Label>
						<Input name="name" />
					</div>
					<div class="grid gap-3">
						<Label for="available" class="text-end">Availability</Label>
						<Input name="available" />
					</div>
                    <div class="grid gap-3">
						<Label for="max_capacity" class="text-end">Max Capacity</Label>
						<Input name="max_capacity" />
					</div>
					<div class="grid gap-3">
						<Label for="access" class="text-end">Access</Label>
						<SelectButton
							name={'status'}
							label={'Status'}
							bind:value={statusValue}
							trigContent={statusTriggerContent}
							items={status}
							size="full"
						/>
					</div>
				</div>
			</div>
			<Sheet.Footer>
				<Button type="submit">Save changes</Button>
				<Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
