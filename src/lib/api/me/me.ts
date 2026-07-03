import { api } from '$lib/api';
import type { ApiResponse } from '$lib/types';

export async function loadEventCreatableOrganizations() {
	const res = await api
		.get('me/organizations/event-creatable')
		.json<ApiResponse<{ id: number; name: string }[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
