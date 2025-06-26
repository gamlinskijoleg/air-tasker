import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from "react-native";
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

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#00509e" />
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Користувача не знайдено</Text>
				<Text>Context data: {JSON.stringify({ user, token, role })}</Text>
				<Button title="Спробувати знову" onPress={refetch} />
			</View>
		);
	}

	const handleSetRole = async (newRole: "worker" | "customer") => {
		try {
			await updateRole(newRole);
			setRole(newRole);
			Alert.alert("Успіх", `Роль оновлено до "${newRole}"`);
		} catch (e: any) {
			Alert.alert("Помилка", e.message || "Не вдалося оновити роль");
		}
	};

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

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Акаунт</Text>

			<Text style={styles.label}>Username:</Text>
			<Text style={styles.value}>{username}</Text>

			<Text style={styles.label}>Email:</Text>
			<Text style={styles.value}>{user.email}</Text>

			<Text style={styles.label}>Роль:</Text>
			<Text style={styles.value}>{user.user_role ?? "не вказано"}</Text>

			<View style={styles.buttonContainer}>
				<Button title="🔄 Стати Worker" onPress={() => handleSetRole("worker")} />
			</View>
			<View style={styles.buttonContainer}>
				<Button title="🔄 Стати Customer" onPress={() => handleSetRole("customer")} />
			</View>

			<View style={styles.buttonContainer}>
				<Button title="🚪 Вийти" color="red" onPress={handleLogout} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f8ff",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#00509e",
		marginBottom: 24,
		textAlign: "center",
	},
	label: {
		fontSize: 20,
		fontWeight: "600",
		color: "#00509e",
		marginTop: 12,
	},
	value: {
		fontSize: 18,
		color: "#333",
	},
	errorText: {
		color: "red",
		fontSize: 18,
		textAlign: "center",
	},
	buttonContainer: {
		marginTop: 16,
	},
});
