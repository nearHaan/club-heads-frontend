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

export type OrganizationType = {
	id: string;
	name: string;
	children: {
		childTypeId: string;
	}[];
	selectedId: string;
};

export type AuthUser = {
	user: {
		id: string;
		fullName: string;
		email: string;
	} | null;
	permissions: string[]; //TODO: change data type
};

export type ApiSuccess<T> = {
	success: true;
	data: T;
};

export type ApiFailure = {
	success: false;
	code: number;
	message: string;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

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
