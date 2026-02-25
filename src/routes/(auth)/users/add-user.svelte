<script lang="ts">
	import { createUser } from '$lib/api/users';
	import SelectButton from '$lib/components/app/select-button.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let errorText = $state('');

	const status = [
		{ value: 'Active', label: 'Active' },
		{ value: 'Inactive', label: 'Inactive' }
	];
	let statusValue = $state(status[0]?.label ?? 'Active');
	const statusTriggerContent = $derived(
		status.find((s) => s.value === statusValue)?.label ?? 'Active'
	);

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const name = formData.get('name') as string;
			const email = formData.get('email') as string;
			const status = formData.get('status') as string;

			if (await createUser(name, email, status)) {
				console.log('User Added');
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
					<Sheet.Title>Add User</Sheet.Title>
					<Sheet.Description>
						Enter the details of the new user. Click save when you're done.
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
						<Label for="email" class="text-end">Email</Label>
						<Input name="email" />
					</div>
					<div class="grid gap-3">
						<Label for="status" class="text-end">Status</Label>
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
