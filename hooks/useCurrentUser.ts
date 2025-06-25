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
			console.error("❌ Помилка при читанні токена з AsyncStorage", e);
		}
		return null;
	}, [initialToken, setToken]);

	// Завантажуємо користувача
	const fetchUser = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const token = await resolveToken();
			if (!token) {
				console.warn("Token not found, clearing user and role");
				setUser(null);
				setRole(null);
				await AsyncStorage.removeItem("user");
				await AsyncStorage.removeItem("token");
				return;
			}

			const res = await axios.get<MeResponse>(`${API_URL}/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.data || !res.data.user) {
				throw new Error("User data not found in response");
			}

			const fetchedUser = res.data.user;

			setUser(fetchedUser);
			setRole(fetchedUser.user_role ?? null);
			setUserContext(fetchedUser); // глобальний контекст 👈

			// Зберігаємо юзера в AsyncStorage
			await AsyncStorage.setItem("user", JSON.stringify(fetchedUser));
		} catch (err: any) {
			const msg = err.response?.data?.error || err.message || "Не вдалося завантажити користувача";
			console.error("❌ Fetch user error:", msg);
			setError(msg);
			setUser(null);
			setRole(null);
			await AsyncStorage.removeItem("user");
		} finally {
			setLoading(false);
		}
	}, [resolveToken, setRole, setUser]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	// Змінити роль користувача
	const updateRole = async (role: "worker" | "customer") => {
		if (!user?.id) throw new Error("Користувача не знайдено", user);

		try {
			await axios.post(`${API_URL}/set-role/${role}`, { uid: user.id });
			await fetchUser();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Не вдалося оновити роль";
			console.error("❌ Update role error:", msg);
			throw new Error(msg);
		}
	};

	// Вийти з акаунту
	const logout = async () => {
		try {
			await axios.post(`${API_URL}/logout`);
			await AsyncStorage.removeItem("token");
			setUser(null);
			setRole(null);
			setToken("");
		} catch (err: any) {
			const msg = err.response?.data?.error || "Помилка при виході";
			console.error("❌ Logout error:", msg);
			throw new Error(msg);
		}
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
