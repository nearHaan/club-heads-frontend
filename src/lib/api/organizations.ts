import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { Organization, OrganizationType, User } from '$lib/types';

export async function loadOrgs() {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/organizations`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!res.ok) {
		return [] as Array<Organization>;
	}

	const orgs: Organization[] = (await res.json()).data.organizations ?? [];

	return orgs;
}

export async function loadOrgTypes() {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/organization-types`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!res.ok) {
		return [] as Array<OrganizationType>;
	}

	const orgs: OrganizationType[] = (await res.json()).data.organizationTypes ?? [];

	return orgs;
}

export async function createOrg(name: string, type: Organization['type'], parent: string) {
	if (!name || !type) {
		throw new Error('Name and Type are required fields');
	}

	const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/organizations`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name,
			type,
			parentOrganizationId: parseInt(parent) //TODO: discuss uuid
		})
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message);
	}

	return true;
}

export async function addOrgType(name: string) {
	if (!name) {
		throw new Error('Name is required');
	}

	const res = await fetch(`${PUBLIC_API_BASE_URL}/organization-types`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name
		})
	});

	if (!res.ok) {
		console.error(await res.json());
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message);
	}

	return await res.json();
}

export async function addChildOrgType(id: string, childId: string) {
	if (!id || !childId) {
		throw new Error('Parent ID and Child ID are required');
	}

	const res = await fetch(
		`${PUBLIC_API_BASE_URL}/organization-types/${id}/allow-children/${childId}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);

	if (!res.ok) {
		console.error(await res.json());
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message);
	}

	return await res.json();
}
