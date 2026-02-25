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
        accessorKey: 'venue_name',
        header: 'Name'
    },
    {
        accessorKey: 'access_level',
        header: 'Access'
    },
    {
        accessorKey: 'is_available',
        header: 'Available'
    },
    {
        accessorKey: 'max_capacity',
        header: 'Max Capacity'
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return renderComponent(DataTableActions, { row: row.original });
        }
    }
];
