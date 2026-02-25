import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { Role } from '$lib/types';

export async function loadRoles() {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/roles`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!res.ok) {
		return [] as Array<Role>;
	}

	const roles: Role[] = (await res.json()).data.roles ?? [];

	return roles;
}
