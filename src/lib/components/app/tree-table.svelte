<script lang="ts" generics="T extends {id: number}">
	import type { ActionMenuItem } from '$lib/types';
	import type { Snippet } from 'svelte';
	import DataTableActions from './data-table-actions.svelte';

	type TreeTableColumn<T> = {
		header: string;
		render: Snippet<[T, number]>;
		class?: string;
	};

	let {
		items,
		columns,
		getParentId = undefined,
		onRowClick,
		actions,
		actionPrefix,
		visibleItemIds = null,
		emptyMessage = 'No results.',
		itemLabel = 'items',
		treeMode = true,
		mobileRow = undefined
	}: {
		items: T[];
		columns: TreeTableColumn<T>[];
		getParentId?: (item: T) => number | null;
		onRowClick?: (item: T) => void;
		actions?: ActionMenuItem<T>[];
		actionPrefix?: Snippet<[T]>;
		visibleItemIds?: Set<number> | null;
		emptyMessage?: string;
		itemLabel?: string;
		treeMode?: boolean;
		mobileRow?: import('svelte').Snippet<[T, number]>;
	} = $props();

	type TreeNode<T> = {
		item: T;
		children: TreeNode<T>[];
		depth: number;
		isLast: boolean[];
	};

	let tree = $derived.by<TreeNode<T>[]>(() => {
		if (!getParentId || !treeMode) {
			return items.map((item, index) => ({
				item,
				children: [],
				depth: 0,
				isLast: [index === items.length - 1]
			}));
		}

		const childrenMap = new Map<number | null, T[]>();
		const itemSet = new Set(items.map((item) => item.id));

		for (const item of items) {
			const parentId = getParentId(item);
			const effectiveParentId = parentId !== null && itemSet.has(parentId) ? parentId : null;
			if (!childrenMap.has(effectiveParentId)) {
				childrenMap.set(effectiveParentId, []);
			}
			childrenMap.get(effectiveParentId)!.push(item);
		}

		function buildNodes(parentId: number | null, depth: number, isLast: boolean[]): TreeNode<T>[] {
			const children = childrenMap.get(parentId) ?? [];
			return children.map((item, index) => {
				const currentIsLast = [...isLast, index === children.length - 1];
				return {
					item,
					children: buildNodes(item.id, depth + 1, currentIsLast),
					depth,
					isLast: currentIsLast
				};
			});
		}

		return buildNodes(null, 0, []);
	});

	let flatNodes = $derived.by<TreeNode<T>[]>(() => {
		const result: TreeNode<T>[] = [];
		function flatten(nodes: TreeNode<T>[]) {
			for (const node of nodes) {
				if (visibleItemIds === null || visibleItemIds.has(node.item.id)) {
					result.push(node);
					flatten(node.children);
				}
			}
		}
		flatten(tree);
		return result;
	});
</script>

<div class="hidden overflow-x-auto rounded-sm border bg-background bg-clip-border md:block">
	<div class="relative w-full">
		<table class="w-full text-sm">
			<thead class="border-b bg-primary/5">
				<tr>
					{#each columns as column, i (i)}
						<th class={['px-xs py-xxs text-start text-xs font-normal', column.class]}>
							{column.header}
						</th>
					{/each}
					{#if (actions && actions.length > 0) || actionPrefix}
						<th class="w-0 px-xs py-xxs"></th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each flatNodes as node, i (node.item.id)}
					<tr
						class={[!treeMode ? 'border-b' : '', 'last:border-0 hover:bg-accent', onRowClick ? 'cursor-pointer' : '']}
						onclick={() => onRowClick?.(node.item)}
					>
						{#each columns as column, colIdx (colIdx)}
							<td
								class={['relative px-xs py-xxs', column.class]}
								style={colIdx === 0 && treeMode ? `padding-left: ${node.depth * 1.5 + 1}rem;` : ''}
							>
								{#if colIdx === 0 && treeMode}
									{#each Array.from({ length: node.depth + 1 }) as _, d}
										{#if d === node.depth}
											{#if node.children.length > 0}
												<div
													class="pointer-events-none absolute z-0 w-[2px] bg-border"
													style={`top: 50%; bottom: 0; left: ${d * 1.5 + 1.75}rem;`}
												></div>
											{/if}
										{:else if d === node.depth - 1}
											<div
												class="pointer-events-none absolute top-0 z-0 w-[2px] bg-border"
												style={`left: ${d * 1.5 + 1.75}rem; height: ${node.isLast[node.depth] ? '50%' : '100%'};`}
											></div>
											<div
												class="pointer-events-none absolute z-0 h-[2px] bg-border"
												style={`top: 50%; left: ${d * 1.5 + 1.75}rem; width: 0.75rem;`}
											></div>
										{:else if !node.isLast[d + 1]}
											<div
												class="pointer-events-none absolute top-0 z-0 h-full w-[2px] bg-border"
												style={`left: ${d * 1.5 + 1.75}rem;`}
											></div>
										{/if}
									{/each}
								{/if}
								<div class="relative z-10 flex items-center gap-2">
									{@render column.render(node.item, node.depth)}
								</div>
							</td>
						{/each}
						{#if (actions && actions.length > 0) || actionPrefix}
							<td class={['w-0 px-xs py-xxs text-end', !treeMode ? 'border-b' : '']} onclick={(e) => e.stopPropagation()}>
								<div class="flex items-center justify-end gap-2">
									{#if actionPrefix}
										{@render actionPrefix(node.item)}
									{/if}
									{#if actions && actions.length > 0}
										<DataTableActions selectedItem={node.item} {actions} />
									{/if}
								</div>
							</td>
						{/if}
					</tr>
				{/each}
				{#if flatNodes.length === 0}
					<tr>
						<td
							colspan={columns.length + ((actions && actions.length > 0) || actionPrefix ? 1 : 0)}
							class="py-lg px-xs text-center text-muted-foreground"
						>
							{emptyMessage}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
	{#if flatNodes.length > 0}
		<div class="border-t px-xs py-xxs text-xs text-muted-foreground">
			Showing 1 to {flatNodes.length} of {flatNodes.length}
			{itemLabel}
		</div>
	{/if}
</div>

<div class="md:hidden">
	{#if mobileRow}
		<div class="rounded-sm border bg-background">
			{#if flatNodes.length === 0}
				<div class="p-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
			{/if}
			{#each flatNodes as node (node.item.id)}
				<div class="relative border-b last:border-0 hover:bg-accent/50">
					{@render mobileRow(node.item, node.depth)}
				</div>
			{/each}
		</div>
	{:else}
		{#each flatNodes as node (node.item.id)}
			<div class="relative py-1">
			{#if treeMode}
				{#each Array.from({ length: node.depth + 1 }) as _, d}
					{#if d === node.depth}
						{#if node.children.length > 0}
							<div
								class="pointer-events-none absolute z-0 w-[2px] bg-border"
								style={`top: 50%; bottom: 0; left: ${d * 1.5 + 0.75}rem;`}
							></div>
						{/if}
					{:else if d === node.depth - 1}
						<div
							class="pointer-events-none absolute top-0 z-0 w-[2px] bg-border"
							style={`left: ${d * 1.5 + 0.75}rem; height: ${node.isLast[node.depth] ? '50%' : '100%'};`}
						></div>
						<div
							class="pointer-events-none absolute z-0 h-[2px] bg-border"
							style={`top: 50%; left: ${d * 1.5 + 0.75}rem; width: 0.75rem;`}
						></div>
					{:else if !node.isLast[d + 1]}
						<div
							class="pointer-events-none absolute top-0 z-0 h-full w-[2px] bg-border"
							style={`left: ${d * 1.5 + 0.75}rem;`}
						></div>
					{/if}
				{/each}
			{/if}

			{#if onRowClick}
				<div
					class="relative z-10 flex gap-3 rounded-sm border bg-background p-3 transition-colors hover:bg-accent"
					style={treeMode ? `margin-left: ${node.depth * 1.5}rem;` : ''}
					onclick={() => onRowClick(node.item)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') onRowClick(node.item);
					}}
					role="button"
					tabindex={0}
				>
					<div class="flex min-w-0 flex-1 flex-col gap-1.5">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								{@render columns[0].render(node.item, node.depth)}
							</div>
							{#if (actions && actions.length > 0) || actionPrefix}
								<div
									class="flex shrink-0 items-center gap-2"
									role="presentation"
									onclick={(e) => e.stopPropagation()}
								>
									{#if actionPrefix}
										{@render actionPrefix(node.item)}
									{/if}
									{#if actions && actions.length > 0}
										<DataTableActions selectedItem={node.item} {actions} />
									{/if}
								</div>
							{/if}
						</div>
						{#if columns.length > 1}
							<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
								{#each columns.slice(1) as column, i (i)}
									<div class="flex items-center gap-1">
										<span>{column.header}:</span>
										{@render column.render(node.item, node.depth)}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div
					class="relative z-10 flex gap-3 rounded-sm border bg-background p-3"
					style={treeMode ? `margin-left: ${node.depth * 1.5}rem;` : ''}
				>
					<div class="flex min-w-0 flex-1 flex-col gap-1.5">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								{@render columns[0].render(node.item, node.depth)}
							</div>
							{#if (actions && actions.length > 0) || actionPrefix}
								<div
									class="flex shrink-0 items-center gap-2"
									role="presentation"
									onclick={(e) => e.stopPropagation()}
								>
									{#if actionPrefix}
										{@render actionPrefix(node.item)}
									{/if}
									{#if actions && actions.length > 0}
										<DataTableActions selectedItem={node.item} {actions} />
									{/if}
								</div>
							{/if}
						</div>
						{#if columns.length > 1}
							<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
								{#each columns.slice(1) as column, i (i)}
									<div class="flex items-center gap-1">
										<span>{column.header}:</span>
										{@render column.render(node.item, node.depth)}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/each}
	{#if flatNodes.length === 0}
		<div class="py-lg rounded-sm border px-xs text-center text-sm text-muted-foreground">
			{emptyMessage}
		</div>
	{/if}
	{/if}
</div>
