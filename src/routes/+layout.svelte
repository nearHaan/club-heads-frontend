<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { authUser } from '$lib/api/auth';
	import { onMount } from 'svelte';

	let { children } = $props();

	let authenticated = $state(false);

	onMount(async () => {
		try {
			await authUser();
			authenticated = true;
		} catch (err: any) {
			console.error(err.message);
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster />

{#if authenticated}
	{@render children()}
{:else}
	Authenticating...
{/if}
