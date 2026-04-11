import { renderComponent } from '$lib/components/ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import VenueActions from './venue-actions.svelte';
import { Checkbox } from '$lib/components/ui/checkbox';
import type { Venue } from '$lib/types';

export const columns: ColumnDef<Venue>[] = [
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
		accessorKey: 'name',
		header: 'Name'
	},
	{
		accessorKey: 'maxCapacity',
		header: 'Max Capacity'
	},
	{
		accessorKey: 'accessLevel',
		header: 'Access Level'
	},
	{
		accessorKey: 'isAvailable',
		header: 'Available',
		cell: ({ row }) => {
			return row.original.isAvailable ? 'Yes' : 'No';
		}
	},
	{
		accessorKey: 'isActive',
		header: 'Status',
		cell: ({ row }) => {
			return row.original.isActive ? 'Active' : 'Inactive';
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(VenueActions, { row: row.original });
		}
	}
];
