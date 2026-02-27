type OrganizationRole = {
	id: string;
	isActive: boolean;
	roleId: string;
	organizationId: string;
};

export type User = {
	id: string;
	fullName: string;
	email: string;
	type: 'admin' | 'end_user';
	isActive: boolean;
	organizationRoles: OrganizationRole[];
};

// TODO: Match types
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

export enum ERROR_CODES {
	// todo: sort
	validation_error = 'VALIDATION_ERROR',
	user_not_found = 'USER_NOT_FOUND',
	unauthorized = 'UNAUTHORIZED',
	already_exists = 'ALREADY_EXISTS',
	internal_server_error = 'INTERNAL_SERVER_ERROR',
	invalid_related_entity = 'INVALID_RELATED_ENTITY', // todo: what? make this better
	forbidden = 'FORBIDDEN'
}

export type ApiFailure = {
	success: false;
	code: ERROR_CODES;
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
