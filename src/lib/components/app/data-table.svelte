<script lang="ts" generics="T extends {id: number}">
	import type { TableProps } from '$lib/types';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import DataTableActions from './data-table-actions.svelte';
	import { slide } from 'svelte/transition';

	let {
		columns,
		data,
		selectable = false,
		onSelectionChange,
		optionsList,
		expandable = false,
		expandedContent
	}: TableProps<T> = $props();

	type RowWithSelection<T> = T & { rowSelected: boolean; isExpanded: boolean };

	let internalData = $state<RowWithSelection<T>[]>([]);

	$effect(() => {
		if (!data) return;
		internalData = data.map((row) => ({
			...row,
			rowSelected: false,
			isExpanded: false
		}));
	});

	function toggleAll(checked: boolean) {
		internalData = internalData.map((row) => ({ ...row, rowSelected: checked }));
	}

	function toggleRow(id: number, checked: boolean) {
		internalData = internalData.map((row) =>
			row.id === id ? { ...row, rowSelected: checked } : row
		);
	}

	let selectedRows = $derived(internalData.filter((data) => data.rowSelected === true));

	$effect(() => {
		onSelectionChange?.(selectedRows);
	});

	const allSelected = $derived(
		selectedRows.length === internalData.length && selectedRows.length > 0
	);
	const someSelected = $derived(
		selectedRows.length < internalData.length && selectedRows.length > 0
	);
</script>

<div class="overflow-x-auto rounded-sm border bg-background bg-clip-border">
	<div class="relative w-full">
		<table class="w-full text-sm">
			<thead class="border-b bg-primary/5">
				<tr class="">
					{#if selectable}
						<th class="px-xs py-xxs text-start">
							<input
								type="checkbox"
								checked={allSelected}
								indeterminate={someSelected}
								onchange={(e) => toggleAll(e.currentTarget.checked)}
							/>
						</th>
					{/if}
					{#each columns as column, i (i)}
						<th class="px-xs py-xxs text-start text-xs font-normal">
							{column.header ?? ''}
						</th>
					{/each}
					{#if expandable}
						<th class="w-0 px-xs py-xxs"></th>
					{/if}
					{#if optionsList && optionsList?.length > 0}
						<th class="w-0 px-xs py-xxs"></th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each internalData as row, i (i)}
					<tr class={`border-b last:border-0 hover:bg-accent ${row.isExpanded ? 'bg-accent' : ''}`}>
						{#if selectable}
							<td class="px-xs py-xxs">
								<input
									type="checkbox"
									checked={row.rowSelected}
									onchange={(e) => toggleRow(row.id, e.currentTarget.checked)}
								/>
							</td>
						{/if}
						{#each columns as col, i (i)}
							{#if col.type === 'link'}
								<td class="px-xs py-xxs">
									<a href={col.href ? `${col.href}${row.id ?? ''}` : '#'}>{row[col.key!] ?? '-'}</a>
								</td>
							{:else if col.type === 'button'}
								<td class="px-xs py-xxs">
									<Button
										class="cursor-pointer border-none bg-transparent p-0 shadow-none"
										onclick={() => col.onclick && col.onclick(row)}
										variant="outline">{row[col.key!] ?? '-'}</Button
									>
								</td>
							{:else if col.type === 'transformValue'}
								<td class="px-xs py-xxs">
									{col.transformValue!(row, '-')}
								</td>
							{:else}
								<td class="px-xs py-xxs">
									{row[col.key!] ?? '-'}
								</td>
							{/if}
						{/each}
						{#if expandable}
							<td class="w-0 px-xs py-xxs"
								><Button
									onclick={() => {
										row.isExpanded = !row.isExpanded;
									}}
									variant="ghost"
									size="icon-sm"
								>
									{#if row.isExpanded}
										<ChevronUp />
									{:else}
										<ChevronDown />
									{/if}
								</Button></td
							>
						{/if}
						{#if optionsList && optionsList.length > 0}
							<td class="w-0 px-xs py-xxs text-end"
								><DataTableActions selectedItem={row} actions={optionsList} /></td
							>
						{/if}
					</tr>
					{#if expandedContent && expandable && row.isExpanded}
						<tr class="border-b">
							{#if selectable}
								<td></td>
							{/if}
							<td colspan={columns.length + (optionsList && optionsList?.length > 0 ? 1 : 0)}>
								{@render expandedContent(row)}
							</td>
						</tr>
					{/if}
				{/each}
				{#if data.length === 0}
					<tr>
						<td
							colspan={columns.length + (selectable ? 1 : 0)}
							class="py-lg px-xs text-center text-muted-foreground"
						>
							No results.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
