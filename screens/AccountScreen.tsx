import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainTabsParamList } from "../App";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

type Props = NativeStackScreenProps<MainTabsParamList, "account">;

export default function AccountScreen({ navigation }: Props) {
	const { user, token, role, setRole } = useUserContext();
	const { loading, error, refetch, updateRole, logout } = useCurrentUser(token);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		if (error) Alert.alert("Помилка", error);
	}, [error]);

	const email = user?.email;
	useEffect(() => {
		const fetchUsername = async () => {
			try {
				const res: any = await axios.get("http://localhost:3000/user/username", { params: { email } });
				setUsername(res.data.username || null);
			} catch (error) {
				console.error(error);
				setUsername(null);
			}
		};

		if (email) {
			fetchUsername();
		}
	}, [email]);

	const handleLogout = async () => {
		try {
			await logout();
			navigation.getParent()?.reset({
				index: 0,
				routes: [{ name: "login" }],
			});
		} catch {
			Alert.alert("Помилка", "Не вдалося вийти з акаунту");
		}
	};

	const handleSetRole = async (newRole: "worker" | "customer") => {
		try {
			await updateRole(newRole);
			setRole(newRole);
			Alert.alert("Успіх", `Роль оновлено до "${newRole}"`);
		} catch (e: any) {
			Alert.alert("Помилка", e.message || "Не вдалося оновити роль");
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#00509e" />
			</View>
		);
	}

	if (!user) {
		return (
			<View style={[styles.container, styles.center]}>
				<Text style={styles.errorText}>Користувача не знайдено</Text>
				<TouchableOpacity style={styles.retryButton} onPress={refetch}>
					<Text style={styles.retryButtonText}>Спробувати знову</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
					<Text style={styles.logoutButtonText}>🚪 Вийти</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Акаунт</Text>

			<View style={styles.card}>
				<Text style={styles.label}>Username</Text>
				<Text style={styles.value}>{username ?? "—"}</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.label}>Email</Text>
				<Text style={styles.value}>{user.email}</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.label}>Роль</Text>
				<Text style={styles.value}>{user.user_role ?? "не вказано"}</Text>
			</View>

			<View style={styles.actionsContainer}>
				<TouchableOpacity style={[styles.button, user.user_role === "worker" && styles.activeButton]} onPress={() => handleSetRole("worker")} activeOpacity={0.8}>
					<Text style={[styles.buttonText, user.user_role === "worker" && styles.activeButtonText]}>Стати Worker</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, user.user_role === "customer" && styles.activeButton]} onPress={() => handleSetRole("customer")} activeOpacity={0.8}>
					<Text style={[styles.buttonText, user.user_role === "customer" && styles.activeButtonText]}>Стати Customer</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout} activeOpacity={0.8}>
					<Text style={styles.logoutButtonText}>🚪 Вийти</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "#f5f9ff",
		flexGrow: 1,
	},

	center: {
		justifyContent: "center",
		alignItems: "center",
	},

	title: {
		fontSize: 36,
		fontWeight: "900",
		color: "#004080",
		marginBottom: 32,
		textAlign: "center",
	},

	card: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 14,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},

	label: {
		fontSize: 18,
		fontWeight: "700",
		color: "#003366",
		marginBottom: 8,
		letterSpacing: 0.5,
	},

	value: {
		fontSize: 20,
		color: "#222",
	},

	actionsContainer: {
		marginTop: 20,
	},

	button: {
		backgroundColor: "#0072ce",
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 12,
		marginBottom: 16,
		alignItems: "center",
		shadowColor: "#0072ce",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 8,
		elevation: 4,
	},

	activeButton: {
		backgroundColor: "#004080",
	},

	buttonText: {
		color: "white",
		fontWeight: "700",
		fontSize: 18,
	},

	activeButtonText: {
		color: "#a0c4ff",
	},

	logoutButton: {
		backgroundColor: "#cc3333",
		shadowColor: "#cc3333",
	},

	logoutButtonText: {
		color: "white",
		fontWeight: "800",
		fontSize: 18,
	},

	errorText: {
		color: "#b00020",
		fontSize: 20,
		textAlign: "center",
		marginBottom: 20,
	},

	retryButton: {
		backgroundColor: "#00509e",
		paddingVertical: 14,
		paddingHorizontal: 28,
		borderRadius: 10,
		marginBottom: 16,
	},

	retryButtonText: {
		color: "white",
		fontWeight: "700",
		fontSize: 16,
		textAlign: "center",
	},
});
