import { renderComponent } from '$lib/components/ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from '../../../lib/components/data-table/data-table-actions.svelte';
import { Checkbox } from '$lib/components/ui/checkbox';
import type { User } from '$lib/types';

export const columns: ColumnDef<User>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'fullName',
		header: 'Name'
	},
	{
		id: 'role',
		accessorKey: 'role',
		header: 'Role(s)'
	},
	{
		accessorKey: 'email',
		header: 'Email'
	},
	{
		accessorKey: 'isActive',
		header: 'Status'
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, { row: row.original });
		}
	}
];
