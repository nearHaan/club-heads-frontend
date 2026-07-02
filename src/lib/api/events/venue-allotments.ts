import { api } from '$lib/api';
import type { ApiResponse } from '$lib/types';

export async function allotEventVenue(
	eventId: number,
	venueId: number,
	startsAt: string,
	endsAt: string
) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!venueId) {
		throw new Error('Venue ID is required');
	}
	if (!startsAt || !endsAt) {
		throw new Error('Start time and End time required');
	}
	const res = await api
		.post(`events/${eventId}/venue-allotments`, {
			json: { venueId, startsAt, endsAt }
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function deleteEventVenue(eventId: number, allotmentId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!allotmentId) {
		throw new Error('Allotment ID is required');
	}
	const res = await api
		.delete(`events/${eventId}/venue-allotments/${allotmentId}`)
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
