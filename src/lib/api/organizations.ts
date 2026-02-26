import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from '$lib/api';
import type { ApiResponse, Organization, OrganizationType, User } from '$lib/types';

export async function loadOrgs() {
	const res = await api.get('admin/organizations').json<
		ApiResponse<{
			organizations: Organization[];
		}>
	>();
	if (res.success) {
		return res.data.organizations;
	} else {
		throw new Error(res.message);
	}
}

export async function loadOrgTypes() {
	const res = await api.get('organization-types').json<
		ApiResponse<{
			organizationTypes: OrganizationType[];
		}>
	>();
	if (res.success) {
		return res.data.organizationTypes;
	} else {
		throw new Error(res.message);
	}
}

export async function createOrg(name: string, type: Organization['type'], parent: string) {
	if (!name || !type) {
		throw new Error('Name and Type are required fields');
	}

	const res = await api
		.post('admin/organizations', { json: { name, type, parentOrganizationId: parseInt(parent) } })
		.json<
			ApiResponse<{
				id: string;
				name: string;
				organizationTypeId: string;
				parentOrganizationId: string;
			}>
		>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addOrgType(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}
	const res = await api.post('organization-types', { json: { name } }).json<
		ApiResponse<{
			id: string;
			name: string;
		}>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addChildOrgType(id: string, childId: string) {
	if (!id || !childId) {
		throw new Error('Parent ID and Child ID are required');
	}
	const res = await api
		.post(`organization-types/${id}/allow-children/${childId}`, { json: { name } })
		.json<
			ApiResponse<{
				allowedParent: {
					parentTypeId: string;
					childTypeId: string;
				};
			}>
		>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
