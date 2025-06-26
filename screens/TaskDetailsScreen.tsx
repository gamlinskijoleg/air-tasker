import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useUserContext } from "../context/UserContext";
import axios from "axios";

type TaskDetailsRouteProp = RouteProp<RootStackParamList, "taskDetails">;
type Props = {
	route: TaskDetailsRouteProp;
};

export default function TaskDetailsScreen({ route }: Props) {
	const { task } = route.params;
	const { token, user } = useUserContext();
	const navigation = useNavigation();
	const [loading, setLoading] = useState(false);

	const applyForTask = async () => {
		try {
			setLoading(true);
			await axios.post(
				`http://localhost:3000/tasks/apply/${task.id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			Alert.alert("Успіх", "Ви успішно подалися на завдання!");
			navigation.goBack(); // або оновити дані
		} catch (err: any) {
			const msg = err.response?.data?.error || "Не вдалося податись на завдання";
			Alert.alert("Помилка", msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{task.title}</Text>

			<View style={styles.infoBox}>
				<DetailRow icon="briefcase-outline" label="Тип" value={task.type} />
				<DetailRow icon="map-marker" label="Місце" value={task.place} />
				<DetailRow icon="cash" label="Ціна" value={`${task.price} грн`} />
				<DetailRow icon="calendar" label="Дата" value={task.day} />
				<DetailRow icon="clock-outline" label="Час" value={task.time} />
				<DetailRow icon="information-outline" label="Статус" value={task.status} color={getStatusColor(task.status)} />
			</View>

			{task.description && (
				<View style={styles.descriptionBox}>
					<Text style={styles.descriptionLabel}>Опис:</Text>
					<Text style={styles.descriptionText}>{task.description}</Text>
				</View>
			)}

			{user?.user_role === "worker" && (
				<View style={styles.buttonWrapper}>
					<Button title={loading ? "Подання..." : "Податись на завдання"} onPress={applyForTask} color="#2a9d8f" disabled={loading} />
				</View>
			)}
		</View>
	);
}

const DetailRow = ({ icon, label, value, color = "#333" }: { icon: string; label: string; value: string; color?: string }) => (
	<View style={styles.row}>
		<MaterialCommunityIcons name={icon} size={20} color="#00509e" style={styles.icon} />
		<Text style={styles.label}>{label}:</Text>
		<Text style={[styles.value, { color }]}>{value}</Text>
	</View>
);

const getStatusColor = (status: string) => {
	switch (status) {
		case "Open":
			return "#2a9d8f";
		case "Canceled":
			return "#e76f51";
		case "Assigned":
			return "#f4a261";
		default:
			return "#333";
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f0f8ff",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#00509e",
		marginBottom: 20,
		textAlign: "center",
	},
	infoBox: {
		backgroundColor: "#ffffff",
		borderRadius: 10,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	icon: {
		marginRight: 8,
	},
	label: {
		fontSize: 16,
		color: "#00509e",
		fontWeight: "600",
		width: 80,
	},
	value: {
		fontSize: 16,
		fontWeight: "500",
		flexShrink: 1,
	},
	descriptionBox: {
		marginTop: 20,
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
		elevation: 2,
	},
	descriptionLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#00509e",
		marginBottom: 8,
	},
	descriptionText: {
		fontSize: 16,
		color: "#333",
		lineHeight: 22,
	},
	buttonWrapper: {
		marginTop: 30,
	},
});
