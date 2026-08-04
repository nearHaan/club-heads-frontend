import { api } from '$lib/api';
import type { ApiResponse, FacilityType } from '$lib/types';

export async function loadFacilityTypes() {
	const res = await api.get('facility-types').json<ApiResponse<FacilityType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addFacilityType(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post('facility-types', { json: { name } }).json<
		ApiResponse<{
			id: number;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadRolesFacilityType(id: number) {
	if (!id) {
		throw new Error('ID is required');
	}
	const res = await api.get(`facility-types/${id}/roles`).json<
		ApiResponse<
			{
				id: number;
				name: string;
			}[]
		>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addFacilityTypeRole(id: number, name: string) {
	if (!id || !name) {
		throw new Error('ID and Name are required');
	}
	const res = await api.post(`facility-types/${id}/roles`, { json: { name } }).json<
		ApiResponse<{
			id: number;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
