export type User = {
	id: string;
	name: string;
	role: ('Club Head' | 'Faculty Coordinator')[];
	email: string;
	status: 'active' | 'inactive';
};
