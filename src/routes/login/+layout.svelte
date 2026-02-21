<script lang="ts">
	import type { LayoutProps } from '../$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex h-screen w-screen justify-center p-r-pad">
	{@render children()}
</div>
