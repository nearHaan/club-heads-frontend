<script lang="ts">
	import { goto } from '$app/navigation';
	import { loginUser } from '$lib/api/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	let errorText = $state('');

	async function handleSubmit(e: SubmitEvent) {
		try {
			errorText = '';
			e.preventDefault();
			const formData = new FormData(e.currentTarget as HTMLFormElement);

			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			if (await loginUser(email, password)) {
				goto('/users');
			}
		} catch (err: any) {
			errorText = err.message;
		}
	}
</script>

<div class="flex h-full w-full flex-col overflow-auto md:w-lg md:border md:p-r-pad">
	<div class="my-auto flex flex-col">
		<h1 class="mb-xs text-primary">Login</h1>
		<p>Log in to your account</p>
		<form onsubmit={handleSubmit} class=" mt-heavy flex flex-col gap-y-sm">
			{#if errorText}
				<p class="text-sm text-red-500">{errorText}</p>
			{/if}
			<div class="flex flex-col gap-y-xxxs">
				<Label for="email">Email</Label>
				<Input type="email" name="email" placeholder="example@domain.com" />
			</div>
			<div class="flex flex-col gap-y-xxxs">
				<Label for="password">Password</Label>
				<Input type="password" name="password" placeholder="******" />
			</div>
			<Button type="submit" class="mt-heavy">Log In</Button>
		</form>
	</div>
</div>
