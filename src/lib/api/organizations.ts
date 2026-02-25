import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { Organization, User } from '$lib/types';

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

export async function createOrg(name: string, type: Organization['type'], parent: string) {
	if (!name || !type) {
		throw new Error('Name and Type are required fields');
	}

	console.log(name, type, parent);

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
