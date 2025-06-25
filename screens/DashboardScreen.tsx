import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../App";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserContext } from "../context/UserContext";

type Props = BottomTabScreenProps<MainTabsParamList, "dashboard">;

export default function DashboardScreen({ route }: Props) {
	const { user, token, role } = useUserContext();
	const { loading, error, refetch } = useCurrentUser(token);

	useEffect(() => {
		if (error) Alert.alert("Помилка", error);
	}, [error]);

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
				<View style={styles.container}>
					<Text>Користувача не знайдено</Text>
					<Text>Context data: {JSON.stringify({ user, token, role })}</Text>

					<Button title="Спробувати знову" onPress={refetch} />
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Dashboard</Text>

			<Text style={styles.label}>Email:</Text>
			<Text style={styles.value}>{user.email}</Text>

			<Text style={styles.label}>Роль:</Text>
			<Text style={styles.value}>{user.user_role}</Text>

			{user.user_role === "customer" ? (
				<View style={styles.roleBox}>
					<Text style={styles.roleText}>Ласкаво просимо, клієнте!</Text>
					<Text>Ви можете шукати виконавців та створювати завдання.</Text>
				</View>
			) : user.user_role === "worker" ? (
				<View style={styles.roleBox}>
					<Text style={styles.roleText}>Вітаємо, працівнику!</Text>
					<Text>Перегляньте доступні завдання та подавайте заявки.</Text>
				</View>
			) : (
				<Text style={styles.warning}>Невідома роль користувача</Text>
			)}
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
		color: "#00509e",
		fontWeight: "600",
		marginTop: 12,
	},
	value: {
		fontSize: 18,
		color: "#333",
	},
	roleBox: {
		marginTop: 24,
		backgroundColor: "#d6eaff",
		padding: 16,
		borderRadius: 8,
	},
	roleText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	warning: {
		marginTop: 20,
		color: "red",
		fontSize: 16,
		textAlign: "center",
	},
});
