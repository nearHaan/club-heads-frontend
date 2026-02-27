<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<Sidebar.Provider class="w-screen">
	<AppSidebar />
	<main class="w-full">
		<div class="border-muted-background relative flex h-12 w-full items-center border-b p-xxxs">
			<Sidebar.Trigger class="z-50" />
			<h2 class="absolute inset-0 flex w-full items-center justify-center text-center">CHW</h2>
		</div>
		{@render children?.()}
	</main>
</Sidebar.Provider>
