import type {
	ApiResponse,
	CreateEventData,
	Event,
	ParentableEvent,
	EventDetail,
	UpdateEventData,
	CreateVenueAllotmentData
} from '$lib/types';
import { api } from '$lib/api';

export async function loadEvents() {
	const res = await api.get('events').json<ApiResponse<Event[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadParentableEvents(
	typeId: number | number,
	organizationId: string | number
) {
	const res = await api
		.get(`events/parentable?typeId=${typeId}&organizationId=${organizationId}`)
		.json<ApiResponse<ParentableEvent[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createEvent(eventData: CreateEventData): Promise<Event> {
	console.log('Sending eventData:', eventData);
	const res = await api
		.post('events', {
			json: eventData
		})
		.json<ApiResponse<Event>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getEvent(id: number) {
	if (!id) {
		throw new Error('Event ID required');
	}
	const res = await api.get(`events/${id}`).json<ApiResponse<EventDetail>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createVenueAllotment(eventId: number, data: CreateVenueAllotmentData) {
	if (!eventId) {
		throw new Error('Event ID required');
	}
	const res = await api
		.post(`events/${eventId}/venue-allotments`, { json: data })
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function assignFacilityToEvent(
	eventId: number,
	facilityId: number,
	venueAllotmentId?: number
) {
	const res = await api
		.post(`events/${eventId}/facility-assignments`, {
			json: {
				facilityId: facilityId,
				venueAllotmentId: venueAllotmentId
			}
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function unassignFacilityFromEvent(eventId: number, facilityAssignmentId: number) {
	const res = await api
		.delete(`events/${eventId}/facility-assignments/${facilityAssignmentId}`)
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
