<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
</script>

<div class="flex h-full w-full flex-col md:w-lg md:border md:p-r-pad">
	<div class="my-auto flex flex-col">
		<h1 class="mb-xs text-primary">Login</h1>
		<p>Log in to your account</p>
		<form class=" mt-heavy flex flex-col gap-y-sm">
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
