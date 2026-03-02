import { PUBLIC_API_BASE_URL } from '$env/static/public';
import ky from 'ky';
import type { ApiResponse } from './types';
import { goto } from '$app/navigation';

const UNPROTECTED_ROUTES = ['auth/login', 'auth/refresh', 'auth/logout'];

export const api = ky.create({
	prefixUrl: PUBLIC_API_BASE_URL,
	headers: {
		Accept: 'application/json'
	},
	throwHttpErrors: false,
	hooks: {
		beforeRequest: [
			(request) => {
				const parsedUrl = new URL(request.url);
				if (!UNPROTECTED_ROUTES.includes(parsedUrl.pathname)) {
					const accessToken = localStorage.getItem('accessToken');
					if (typeof accessToken === 'string' && accessToken.trim().length > 0) {
						request.headers.set('Authorization', `Bearer ${accessToken}`);
					}
				}
			}
		],
		afterResponse: [
			async (request, options, response) => {
				const parsedUrl = new URL(request.url);
				if (!UNPROTECTED_ROUTES.includes(parsedUrl.pathname) && response.status === 401) {
					const response = await ky
						.post(`${PUBLIC_API_BASE_URL}/auth/refresh`, { credentials: 'include' })
						.json<ApiResponse<{ accessToken: string }>>();
					if (response.success) {
						const accessToken = response.data.accessToken;
						localStorage.setItem('accessToken', accessToken);
						ky.retry();
					} else {
						localStorage.removeItem('accessToken');
						goto('/login');
					}
				} else {
					// throw error message because unknown error
				}
			}
		]
	}
});
