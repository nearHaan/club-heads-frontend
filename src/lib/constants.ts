import type { page } from '$app/state';
import type { Event, EventOrganizerInvitation, PermissionCode, WorkflowInstance } from './types';

export const UNPROTECTED_API_ROUTES = [
	'/auth/login',
	'/auth/refresh',
	'/auth/logout',
	'/auth/request-password-token',
	'/auth/validate-token',
	'/auth/reset-password'
];
export const UNPROTECTED_ROUTES = [
	'/login',
	'/',
	'/forgot-password',
	'/new-password',
	'/set-password'
];
export const UNPROTECTED_ROUTE_IDS: (typeof page.route.id)[] = [
	'/(unauth)/login',
	'/(unauth)',
	'/(unauth)/forgot-password',
	'/(unauth)/new-password',
	'/(unauth)/set-password'
];

export const ROUTE_PERMISSIONS: Record<string, PermissionCode[]> = {
	'/users': ['user:create'],
	'/events': [
		'event:allot_venue',
		'event:manage',
		'event:view_all',
		'event:view_all_confirmed',
		'event:view_all_non_draft',
		'event:view_own'
	],
	'/venues': ['venue:add_member', 'venue:create', 'venue:modify_facilities']
} as const;

export const eventStatusColors: Record<Event['status'], string> = {
	draft: 'bg-yellow-400/50',
	pending: 'bg-blue-400/50',
	approved: 'bg-green-400/50',
	cancelled: 'bg-red-400/50',
	overridden: 'bg-purple-400/50'
};

export const eventStatusTextColors: Record<Event['status'], string> = {
	draft: 'text-yellow-700',
	pending: 'text-blue-700',
	approved: 'text-green-700',
	cancelled: 'text-red-700',
	overridden: 'text-purple-700'
};

export const eventOrganizerInvitationStatusColors: Record<
	EventOrganizerInvitation['status'],
	string
> = {
	expired: 'bg-yellow-400/50',
	revoked: 'bg-neutral-400/50',
	accepted: 'bg-green-400/50',
	rejected: 'bg-red-400/50',
	pending: 'bg-blue-400/50'
};

export const eventOrganizerInvitationStatusTextColors: Record<
	EventOrganizerInvitation['status'],
	string
> = {
	expired: 'text-yellow-700',
	revoked: 'text-neutral-700',
	accepted: 'text-green-700',
	rejected: 'text-red-700',
	pending: 'text-blue-700'
};

export const workflowStatusColors: Record<WorkflowInstance['status'], string> = {
	overridden: 'bg-yellow-200',
	active: 'bg-green-200',
	completed: 'bg-green-200',
	aborted: 'bg-red-200',
	denied: 'bg-red-200'
};

export const workflowStatusTextColors: Record<WorkflowInstance['status'], string> = {
	overridden: 'text-yellow-700',
	active: 'text-green-600',
	completed: 'text-green-700',
	aborted: 'text-red-700',
	denied: 'text-red-700'
};

export const workflowStepStatusColors: Record<WorkflowInstance['steps'][0]['status'], string> = {
	overridden: 'bg-yellow-200',
	active: 'bg-green-200',
	completed: 'bg-green-200',
	denied: 'bg-red-200',
	blocked: 'bg-red-200',
	pending: 'bg-blue-200',
	skipped: 'bg-neutral-200'
};

export const workflowStepStatusTextColors: Record<WorkflowInstance['steps'][0]['status'], string> =
	{
		overridden: 'text-yellow-700',
		active: 'text-green-700',
		completed: 'text-green-700',
		denied: 'text-red-700',
		blocked: 'text-red-700',
		pending: 'text-blue-700',
		skipped: 'text-neutral-700'
	};

export const workflowStepAssignmentStatusColors: Record<
	WorkflowInstance['steps'][0]['roles'][0]['targetGroups'][0]['assignments'][0]['status'],
	string
> = {
	approved: 'bg-green-200',
	denied: 'bg-red-200',
	pending: 'bg-blue-200',
	skipped: 'bg-neutral-200'
};

export const workflowStepAssignmentStatusTextColors: Record<
	WorkflowInstance['steps'][0]['roles'][0]['targetGroups'][0]['assignments'][0]['status'],
	string
> = {
	approved: 'text-green-700',
	denied: 'text-red-700',
	pending: 'text-blue-700',
	skipped: 'text-neutral-700'
};
