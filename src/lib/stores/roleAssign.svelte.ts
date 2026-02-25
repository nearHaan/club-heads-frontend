import type { User } from '$lib/types';

export const roleState = $state<{ selectedUser: User | null; assignSheetOpen: boolean }>({
	selectedUser: null,
	assignSheetOpen: false
});
