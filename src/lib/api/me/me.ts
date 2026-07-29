import { api } from '$lib/api';
import type { ApiResponse, CalculatedCalendarEvent } from '$lib/types';

export async function loadEventCreatableOrganizations() {
	const res = await api
		.get('me/organizations/event-creatable')
		.json<ApiResponse<{ id: number; name: string }[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadCalculatedCalendarEvents(params: {
	next: number;
	start: Date | undefined;
	status: ('pending' | 'approved')[];
	venueId?: number | undefined;
}) {
	const res = await api
		.get(
			`me/calendar?next=${params.next}&status=${params.status}&start=${params.start}${params.venueId ? `&venueId=${params.venueId}` : ''}`
		)
		.json<ApiResponse<CalculatedCalendarEvent[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
