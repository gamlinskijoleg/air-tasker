import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../context/UserContext";

const API_URL = "http://localhost:3000";

interface MeResponse {
	user: {
		id: string;
		email: string;
		user_role: "customer" | "worker" | null;
		username: string;
	};
}

export function useCurrentUser(initialToken: string) {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { setRole, setToken, setUser: setUserContext } = useUserContext();

	const resolveToken = useCallback(async (): Promise<string | null> => {
		if (initialToken) return initialToken;
		try {
			const storedToken = await AsyncStorage.getItem("token");
			if (storedToken) {
				setToken(storedToken);
				return storedToken;
			}
		} catch (e) {
			console.error("❌ Error reading token from AsyncStorage", e);
		}
		return null;
	}, [initialToken, setToken]);

	const refreshToken = useCallback(async (): Promise<string | null> => {
		try {
			const storedRefresh = await AsyncStorage.getItem("refreshToken");
			if (!storedRefresh) throw new Error("No refresh token found");

			const res: any = await axios.post(`${API_URL}/refresh-token`, { refreshToken: storedRefresh });
			const newToken = res.data?.accessToken;

			if (!newToken) throw new Error("No access token returned");

			await AsyncStorage.setItem("token", newToken);
			setToken(newToken);
			return newToken;
		} catch (e) {
			console.error("❌ Failed to refresh token", e);
			await AsyncStorage.removeItem("token");
			await AsyncStorage.removeItem("refreshToken");
			setToken("");
			return null;
		}
	}, [setToken]);

	const fetchUser = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			let token = await resolveToken();
			if (!token) throw new Error("Token not found");

			const fetchMe = async (t: string) => {
				return await axios.get<MeResponse>(`${API_URL}/me`, {
					headers: { Authorization: `Bearer ${t}` },
				});
			};

			let res;
			try {
				res = await fetchMe(token);
			} catch (err: any) {
				if (err.response?.status === 401) {
					token = await refreshToken();
					if (!token) throw new Error("Token refresh failed");
					res = await fetchMe(token);
				} else {
					throw err;
				}
			}

			const fetchedUser = res.data.user;
			setUser(fetchedUser);
			setRole(fetchedUser.user_role ?? null);
			setUserContext(fetchedUser);
			await AsyncStorage.setItem("user", JSON.stringify(fetchedUser));
		} catch (err: any) {
			const msg = err.response?.data?.error || err.message || "Failed to fetch user";
			console.error("❌ Fetch user error:", msg);
			setError(msg);
			setUser(null);
			setRole(null);
			await AsyncStorage.removeItem("user");
		} finally {
			setLoading(false);
		}
	}, [resolveToken, refreshToken, setRole, setUserContext]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const updateRole = async (role: "worker" | "customer") => {
		if (!user?.id) throw new Error("User not found");
		try {
			await axios.post(`${API_URL}/set-role/${role}`, { uid: user.id });
			await fetchUser();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Failed to update role";
			console.error("❌ Update role error:", msg);
			throw new Error(msg);
		}
	};

	const logout = async () => {
		try {
			await axios.post(`${API_URL}/logout`);
		} catch {}
		await AsyncStorage.removeItem("token");
		await AsyncStorage.removeItem("refreshToken");
		setUser(null);
		setRole(null);
		setToken("");
	};

	return {
		user,
		loading,
		error,
		refetch: fetchUser,
		updateRole,
		logout,
	};
}
