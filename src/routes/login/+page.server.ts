import { API_BASE_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ request }) => {
		try {
			const formData = await request.formData();

			const email = formData.get('email');
			const password = formData.get('password');

			const res = await fetch(`${API_BASE_URL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (!res.ok) {
				return fail(400, { error: data.message || 'Invalid credentials' });
			}

			localStorage.setItem('token', data.accessToken);

			throw redirect(302, '/users');
		} catch (err: any) {
			return fail(500, { error: err.message || 'Something went wrong' });
		}
	}
};
