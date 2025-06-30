import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserType } from "../App";

type RoleType = "worker" | "customer" | null;

type ContextType = {
	user: UserType | null;
	setUser: (u: UserType | null) => void;
	token: string;
	setToken: (t: string) => void;
	role: RoleType;
	setRole: (r: RoleType) => void;
	refetchUserContext: () => Promise<void>;
};

const UserContext = createContext<ContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUserState] = useState<UserType | null>(null);
	const [token, setTokenState] = useState<string>("");
	const [role, setRoleState] = useState<RoleType>(null);

	const setUser = useCallback((u: UserType | null) => {
		setUserState(u);
		if (u) {
			AsyncStorage.setItem("user", JSON.stringify(u));
			setRoleState(u.user_role);
		} else {
			AsyncStorage.removeItem("user");
			setRoleState(null);
		}
	}, []);

	const setToken = useCallback((t: string) => {
		setTokenState(t);
		if (t) AsyncStorage.setItem("token", t);
		else AsyncStorage.removeItem("token");
	}, []);

	const setRole = useCallback((r: RoleType) => {
		setRoleState(r);
	}, []);

	const refetchUserContext = useCallback(async () => {
		try {
			const storedToken = await AsyncStorage.getItem("token");
			const storedUser = await AsyncStorage.getItem("user");

			if (storedToken) setTokenState(storedToken);
			if (storedUser) {
				const parsedUser: UserType = JSON.parse(storedUser);
				setUserState(parsedUser);
				setRoleState(parsedUser.user_role);
			}
		} catch (err) {
			console.error("Failed to load user context from AsyncStorage", err);
		}
	}, []);

	useEffect(() => {
		refetchUserContext();
	}, [refetchUserContext]);

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				token,
				setToken,
				role,
				setRole,
				refetchUserContext,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (!context) throw new Error("UserContext must be used within a UserProvider");
	return context;
};
