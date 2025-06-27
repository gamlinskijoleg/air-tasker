export interface LoginBody {
	email: string;
	password: string;
}

export interface Task {
	id?: string;
	who_made_id: string;
	who_took?: string | null;
	price: number;
	place: string;
	day: string;
	time: string;
	type: string;
	description?: string;
	title?: string;
	status?: string;
	is_open?: boolean;
	is_taken?: boolean;
	created_at?: string;
}
