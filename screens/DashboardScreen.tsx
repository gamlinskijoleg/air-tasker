import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList, UserType } from "../App";

type Props = BottomTabScreenProps<MainTabsParamList, "dashboard">;

export default function DashboardScreen({ route }: Props) {
	const { user, token } = route.params;

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
