import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { User } from '$lib/types';

export async function loadUsers() {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/users`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!res.ok) {
		return [] as Array<User>;
	}

	const users: User[] = (await res.json()).data.users ?? [];

	return users;
}

export async function createUser(name: string, email: string, status: string) {
	if (!name || !email) {
		throw new Error('Name and Email are required fields');
	}

	const res = await fetch(`${PUBLIC_API_BASE_URL}/admin/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			fullName: name,
			email,
			password: email.split('@')[0] ?? '123456'
			// status
		})
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		const errors: Array<any> = error.errors;
		if (errors && errors.length > 0) {
			throw new Error(errors[0].message);
		} else {
			throw new Error(error.message);
		}
	}

	return true;
}
