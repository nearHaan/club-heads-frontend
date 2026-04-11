import { api } from '$lib/api';
import type { ApiResponse, VenueType } from '$lib/types';

export async function loadVenueTypes() {
	const res = await api.get('venue-types').json<ApiResponse<VenueType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadVenueTypeRoles(id: number) {
	const res = await api.get(`venue-types/${id}/roles`).json<ApiResponse<any[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
