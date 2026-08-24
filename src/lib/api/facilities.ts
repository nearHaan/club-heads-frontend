import { api } from '$lib/api';
import type { ApiResponse, CreateFacilityData, EntityMember, Facility } from '$lib/types';

export async function getFacilityById(id: number) {
	if (!id) {
		throw new Error('Facility ID required');
	}
	const res = await api.get(`facilities/${id}`).json<ApiResponse<Facility>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadFacilities() {
	const res = await api.get('facilities').json<ApiResponse<Facility[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function createFacility(data: CreateFacilityData) {
	const res = await api
		.post('facilities', {
			json: data
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function loadFacilityMembers(id: number) {
	if (!id) {
		throw new Error('Facility ID is required');
	}
	const res = await api.get(`facilities/${id}/members`).json<ApiResponse<EntityMember[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addMemberToFacility(
	id: number,
	memberData: { userId: number; roleId: number }
) {
	const res = await api
		.post(`facilities/${id}/members`, {
			json: memberData
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getFacilityMemberByEmail(id: number, email: string) {
	if (!id) {
		throw new Error('Facility ID required');
	}
	if (!email) {
		throw new Error('Email ID required');
	}
	const res = await api
		.get(`facilities/${id}/members?email=${email}`)
		.json<ApiResponse<EntityMember[]>>();
	if (res.success) {
		return res.data[0];
	} else {
		throw new Error(res.message);
	}
}

export async function updateFacilityMemberRoles(id: number, userId: number, roleIds: number[]) {
	if (!id) {
		throw new Error('Facility ID required');
	}
	if (!userId) {
		throw new Error('User ID required');
	}
	const res = await api
		.put(`facilities/${id}/members/${userId}`, {
			json: {
				roleIds: roleIds
			}
		})
		.json<ApiResponse<{ id: number; roleId: number }[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function deleteFacilityMember(id: number, userId: number) {
	if (!id) {
		throw new Error('Facility ID required');
	}
	if (!userId) {
		throw new Error('User ID required');
	}
	const res = await api
		.delete(`facilities/${id}/members/${userId}`)
		.json<ApiResponse<{ id: number; roleId: number }[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function addProviderToFacility(
	id: number,
	providerData: { providerType: 'organization' | 'venue'; providerId: number }
) {
	const res = await api
		.post(`facilities/${id}/providers`, {
			json: providerData
		})
		.json<ApiResponse<{ id: number }>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function deleteProviderOfFacility(id: number, providerId: number) {
	const res = await api
		.delete(`facilities/${id}/providers/${providerId}`)
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function changeFacilityAvailability(facilityId: number, availability: boolean) {
	const res = await api
		.patch(`facilities/${facilityId}`, {
			json: { availability }
		})
		.json<ApiResponse<true>>();

	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function getEventAssociatedFacilities() {
	const res = await api.get(`facilities/event-associated`).json<
		ApiResponse<
			{
				id: number;
				name: string;
				type: {
					id: number;
					name: string;
				};
				association: 'event' | 'venue_allotment';
				overlapPolicy: 'shared' | 'exclusive';
				workflowParticipationPolicy: 'include' | 'exclude';
				isAvailable: boolean;
				providers: {
					id: number;
					scope: {
						type: 'organization' | 'venue';
						id: number;
						name: string;
						kind: {
							id: number;
							name: string;
						};
					};
				}[];
			}[]
		>
	>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
