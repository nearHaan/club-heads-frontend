<script lang="ts">
	import { Style, Avatar } from '@dicebear/core';
	import shapeGrid from '@dicebear/styles/shape-grid.json' with { type: 'json' };
	import thumbs from '@dicebear/styles/thumbs.json' with { type: 'json' };

	import type { ClassValue } from 'svelte/elements';

	const avatarCache = new Map<string, string>();

	let {
		seed,
		size = 35,
		styleName = 'shape',
		class: className
	}: { seed: string; size?: number; styleName?: 'shape' | 'thumb'; class?: ClassValue } = $props();

	const style = $derived(new Style(styleName === 'shape' ? shapeGrid : thumbs));

	const avatar = $derived.by(() => {
		const cacheKey = `${styleName}:${seed}:${size}`;
		const cached = avatarCache.get(cacheKey);
		if (cached) return cached;
		const result = new Avatar(style, {
			seed,
			size: size,
			borderRadius: styleName === 'shape' ? 0 : 50
		}).toDataUri();
		avatarCache.set(cacheKey, result);
		return result;
	});
</script>

<img src={avatar} alt="Avatar" class={className} />
