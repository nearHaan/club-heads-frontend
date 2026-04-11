import { api } from '$lib/api';
import type { ApiResponse, Venue } from '$lib/types';

export async function loadVenues() {
	const res = await api.get('venues').json<ApiResponse<Venue[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export interface CreateVenueData {
	name: string;
	venueTypeId: number;
	organizationId: number | null;
	maxCapacity: number;
	accessLevel: string;
	isAvailable: boolean;
	unavailabilityReason?: string | null;
}

export async function createVenue(data: CreateVenueData) {
	const res = await api
		.post('venues', {
			json: data
		})
		.json<ApiResponse<Venue>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getVenueMembers(id: number) {
	const res = await api.get(`venues/${id}/members`).json<ApiResponse<any[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addMemberToVenue(id: number, memberData: { userId: number; roleId: number }) {
	const res = await api
		.post(`venues/${id}/members`, {
			json: memberData
		})
		.json<ApiResponse<any>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getVenueFacilities(id: number) {
	const res = await api.get(`venues/${id}/facilities`).json<ApiResponse<any[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function setVenueFacilities(id: number, facilityIds: number[]) {
	const res = await api
		.put(`venues/${id}/facilities`, {
			json: { facilityId: facilityIds }
		})
		.json<ApiResponse<any>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
