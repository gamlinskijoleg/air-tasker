import React, { createContext, useContext, useEffect, useState } from "react";
import type { UserType } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RoleType = "worker" | "customer" | null;

type ContextType = {
	user: UserType | null;
	setUser: (u: UserType | null) => void;
	token: string;
	setToken: (t: string) => void;
	role: RoleType;
	setRole: (r: RoleType) => void;
};

const UserContext = createContext<ContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<UserType | null>(null);
	const [token, setToken] = useState<string>("");
	const [role, setRole] = useState<RoleType>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const storedToken = await AsyncStorage.getItem("token");
				const storedUser = await AsyncStorage.getItem("user");

				if (storedToken) setToken(storedToken);
				if (storedUser) {
					const parsedUser: UserType = JSON.parse(storedUser);
					setUser(parsedUser);
					setRole(parsedUser.user_role); // 👈 важливо
				}
			} catch (err) {
				console.error("❌ Не вдалося завантажити дані з AsyncStorage", err);
			}
		};

		loadData();
	}, []);

	return <UserContext.Provider value={{ user, setUser, token, setToken, role, setRole }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (!context) throw new Error("UserContext must be used within a UserProvider");
	return context;
};
