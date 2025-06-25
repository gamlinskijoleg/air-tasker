import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UserType } from "../App";

interface UseCurrentUserResult {
	user: UserType | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
	updateRole: (role: UserType["user_role"]) => Promise<void>;
	logout: () => Promise<void>;
}

export function useCurrentUser(token?: string): UseCurrentUserResult {
	const [user, setUser] = useState<UserType | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUser = useCallback(async () => {
		if (!token) {
			setError("Токен не передано");
			setUser(null);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await axios.get<{ user: UserType }>("http://localhost:3000/me", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUser(res.data.user);
		} catch (e: any) {
			setError(e.response?.data?.error || e.message || "Не вдалося завантажити дані користувача");
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const updateRole = async (role: UserType["user_role"]) => {
		if (!user?.id) throw new Error("User ID відсутній");

		await axios.post(`http://localhost:3000/set-role/${role}`, { uid: user.id });
		setUser({ ...user, user_role: role });
	};

	const logout = async () => {
		if (!token) return;
		await axios.post("http://localhost:3000/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
		setUser(null);
	};

	return { user, loading, error, refetch: fetchUser, updateRole, logout };
}
