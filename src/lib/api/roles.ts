import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from '$lib/api';
import type { ApiResponse, Role } from '$lib/types';

export async function loadRoles() {
	const res = await api.get('admin/roles').json<
		ApiResponse<{
			roles: Role[];
		}>
	>();
	if (res.success) {
		return res.data.roles;
	} else {
		throw new Error(res.message);
	}
}
