type OrganizationRole = {
	id: string;
	isActive: boolean;
	roleId: string;
	organizationId: string;
};

export type User = {
	id: string;
	fullName: string;
	role: ('Club Head' | 'Faculty Coordinator')[];
	email: string;
	isActive: boolean;
	organizationRoles: OrganizationRole[];
};

export type Organization = {
	id: string;
	name: string;
	type: 'department' | 'club' | 'Institution';
	parentOrganization?: {
		id: string;
		name: string;
		type: 'department' | 'club' | 'institution';
	};
	isActive: boolean;
};

export type Role = {
	id: string;
	createdAt: string;
	roleName: string;
};

export type AssignRole = {
	userId: string;
	roleId: string | null;
	organizationId: string | null;
};

export type ApiSuccess<T> = {
	data: T;
};

export type ApiFailure = {
	code: number;
	message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type LoadedData<T> = LoadingPending | LoadingSuccess<T> | LoadingFailure;

type LoadingSuccess<T> = {
	state: 'success';
	data: T;
};

type LoadingPending = {
	state: 'pending';
	message: string;
};

type LoadingFailure = {
	state: 'failed';
	message: string;
};

export type Venue = {
	organization_id: string;
	venue_name: string;
	venue_type_id: string;
	access_level: 'public' | 'private';
	is_available: boolean;
	unavailability_reason: string;
	max_capacity: number;
};