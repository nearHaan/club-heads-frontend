import { api } from '$lib/api';
import type { ApiResponse, UpdateEventData } from '$lib/types';

export async function submitEvent(eventId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api.post(`events/${eventId}/submit`).json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function cancelEvent(eventId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api.post(`events/${eventId}/cancel`).json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function updateEvent(id: number, data: UpdateEventData) {
	if (!id) {
		throw new Error('Event ID required');
	}
	const res = await api.patch(`events/${id}`, { json: data }).json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
