import { goto } from '$app/navigation';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { api } from '$lib/api';
import { authInfo } from '$lib/global/auth.svelte';
import type { ApiResponse, AuthUser } from '$lib/types';

export async function authUser() {
	const accessToken = localStorage.getItem('accessToken');
	if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
		logout();
	}
	const res = await api
		.post('auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
		.json<ApiResponse<AuthUser>>();
	if (res.success) {
		authInfo.user = res.data.user;
		authInfo.permissions = res.data.permissions;
	} else {
		if (res.code === 401) {
			const refreshRes = await api
				.post('auth/refresh', { credentials: 'include' })
				.json<ApiResponse<AuthUser>>();
			if (refreshRes.success) {
				authInfo.user = refreshRes.data.user;
				authInfo.permissions = refreshRes.data.permissions;
			} else {
				logout();
				return;
			}
		} else {
			throw new Error(res.message);
		}
	}
}

export async function logout() {
	localStorage.clear(); // TODO: rethink - .clear() or removeItem()
	await api.post('auth/logout');
	goto('/login');
}

export async function loginUser(email: string, password: string) {
	const res = await api.post('auth/login', { json: { email, password } }).json<
		ApiResponse<{
			accessToken: string;
		}>
	>();

	if (res.success) {
		localStorage.setItem('token', res.data.accessToken);
	} else {
		throw new Error(res.message);
	}
	return true;
}
