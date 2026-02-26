import type { AuthUser } from '$lib/types';

// TODO: use get() and set()
export const authInfo = $state<AuthUser>({
	user: null,
	permissions: []
});
