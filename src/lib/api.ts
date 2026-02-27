import { PUBLIC_API_BASE_URL } from '$env/static/public';
import ky from 'ky';

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
		afterResponse: []
	}
});
