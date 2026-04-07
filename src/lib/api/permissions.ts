import { api } from '$lib/api';
import type { ApiResponse, PermissionType } from '$lib/types';

export async function loadPermissions() {
	const res = await api.get('permissions').json<ApiResponse<PermissionType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadRolePerms(id: string) {
	const res = await api.get(`roles/${id}/permissions`).json<ApiResponse<PermissionType[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
	if (!roleId && !permissionIds) {
		throw new Error('Role ID and Permission list are required');
	}
	const res = await api.put(`roles/${roleId}/permissions`, { json: { permissionIds } }).json<
		ApiResponse<
			{
				id: string;
			}[]
		>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
