<script lang="ts">
	import Button from '../ui/button/button.svelte';

	let { title, isActive, onclick }: { title: string; isActive: boolean; onclick: Function } =
		$props();
</script>

<div class="w-fit">
	<Button
		onclick={() => {
			onclick(title);
		}}
		class={`${isActive ? 'text-primary' : 'text-muted-foreground'}`}
		variant="ghost">{title}</Button
	>
	<div class={`h-1 rounded-t-xs ${isActive ? 'bg-primary' : 'hidden bg-muted-foreground'}`}></div>
</div>
