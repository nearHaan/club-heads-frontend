import { api } from '$lib/api';
import { ERROR_CODES, type ApiResponse, type WorkflowInstance } from '$lib/types';

export async function loadEventWorkflowsLatest(eventId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api
		.get(`events/${eventId}/workflows/latest`)
		.json<ApiResponse<WorkflowInstance>>();
	if (res.success) {
		return res.data;
	} else {
		if (res.code === ERROR_CODES.not_found) {
			return null;
		}
		throw new Error(res.message);
	}
}

export async function loadEventWorkflow(eventId: number, workflowId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!workflowId) {
		throw new Error('Workflow ID is required');
	}
	const res = await api
		.get(`events/${eventId}/workflows/${workflowId}`)
		.json<ApiResponse<WorkflowInstance>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}

export async function abortEventWorkflow(eventId: number, workflowId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	if (!workflowId) {
		throw new Error('Workflow ID is required');
	}
	const res = await api
		.post(`events/${eventId}/workflows/${workflowId}/abort`)
		.json<ApiResponse<boolean>>();
	if (res.success) {
		return res.data;
	} else {
		if (res.code === ERROR_CODES.not_found) {
			return null;
		}
		throw new Error(res.message);
	}
}

export async function loadEventWorkflows(eventId: number) {
	if (!eventId) {
		throw new Error('Event ID is required');
	}
	const res = await api.get(`events/${eventId}/workflows/`).json<ApiResponse<WorkflowInstance[]>>();
	if (res.success) {
		return res.data;
	} else {
		throw new Error(res.message);
	}
}
