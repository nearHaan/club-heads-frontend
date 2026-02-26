import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from '$lib/api';
import type { ApiResponse, User } from '$lib/types';

export async function loadUsers() {
	const res = await api.get('/admin/users').json<
		ApiResponse<{
			users: User[];
		}>
	>();
	if (res.success) {
		return res.data.users;
	} else {
		throw new Error(res.message);
	}
}

export async function createUser(name: string, email: string, status: string) {
	if (!name || !email) {
		throw new Error('Name and Email are required fields');
	}

	const res = await api
		.post('/admin/users', {
			json: {
				fullName: name,
				email,
				password: email.split('@')[0] ?? '123456'
			}
		})
		.json<
			ApiResponse<{
				user: User;
			}>
		>();
	if (res.success) {
		return res.data.user;
	} else {
		throw new Error(res.message);
	}
}
