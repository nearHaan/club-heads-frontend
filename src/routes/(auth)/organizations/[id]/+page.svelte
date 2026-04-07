<script lang="ts">
	import { page } from '$app/state';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { onMount } from 'svelte';
	import { columns } from './column';
	import type { LoadedData, User } from '$lib/types';
	import { loadUsers } from '$lib/api/users';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PlusIcon } from '@lucide/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Combobox from '$lib/components/app/combobox.svelte';

	let title = $state('');

	let users = $state<LoadedData<User[]>>({
		state: 'pending',
		message: 'Loading users...'
	});

	$effect(() => {
		title = page.params.id!;
		title = 'TKMCE';

		(async () => {
			try {
				users = {
					state: 'success',
					data: await loadUsers()
				};
			} catch (err) {
				users = {
					state: 'failed',
					message: 'Failed to load users'
				};
			}
		})();
	});
</script>

<div class="relative flex">
	<div class="flex w-full max-w-200 flex-col gap-y-xs p-r-pad">
		<div class="flex items-center">
			<h2 class="text-lg">{title}</h2>
			<Badge class="text-xs" variant="secondary">Institution</Badge>
		</div>
		<Separator />
		<div class="flex w-full gap-x-xxs">
			<div class="w-full">
				<Combobox placeholder="Select a user..." emptyMsg="No members found" listItems={[]} />
			</div>
			<Button variant="default"><PlusIcon /> Add Member</Button>
		</div>

		<Separator />
		<div class="overflow-auto p-r-pad">
			{#if users.state === 'pending'}
				<p>{users.message}</p>
			{:else if users.state === 'success'}
				<DataTable {columns} data={users.data} />
			{:else}
				<p>{users.message}</p>
			{/if}
		</div>
	</div>
</div>
