import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Button, ScrollView, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../App";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Props = BottomTabScreenProps<MainTabsParamList, "dashboard">;

export default function DashboardScreen({ route }: Props) {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user, token, role } = useUserContext();
	const { loading, error, refetch } = useCurrentUser(token);
	const [tasks, setTasks] = useState<any[]>([]);
	const [day, setDay] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [price, setPrice] = useState("");
	const [place, setPlace] = useState("");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"error" | "success" | null>(null);
	const [timeOfDay, setTimeOfDay] = useState<string>("Morning");
	const [jobType, setJobType] = useState<string>("Gardening");
	const [description, setDescription] = useState("");

	useEffect(() => {
		if (error) {
			setMessage(error);
			setMessageType("error");
		}
	}, [error]);

	useEffect(() => {
		if (!user) return;

		const url = user.user_role === "worker" ? "http://localhost:3000/tasks/all" : `http://localhost:3000/tasks/user/${user.id}`;

		axios
			.get(url)
			.then((res: any) => setTasks(res.data.tasks))
			.catch((err) => console.error("Error loading tasks", err));
	}, [user]);

	const handleSubmit = async () => {
		try {
			await axios.post(
				"http://localhost:3000/tasks/create",
				{
					title,
					description,
					price: Number(price),
					place,
					day,
					time: timeOfDay,
					type: jobType,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setMessage("Завдання успішно створено!");
			setMessageType("success");
			setShowForm(false);
			setPrice("");
			setPlace("");
			setDay("");
			setTitle("");
			setTimeOfDay("Morning");
			setJobType("Gardening");
		} catch (err: any) {
			const msg = err.response?.data?.error || "Помилка створення завдання";
			setMessage(msg);
			setMessageType("error");
		}
	};

	if (loading) {
		return (
			<View style={styles.center}>
				<Text>Завантаження...</Text>
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.container}>
				<Text>Користувача не знайдено</Text>
				<Text>Context data: {JSON.stringify({ user, token, role })}</Text>
				<Button title="Спробувати знову" onPress={refetch} />
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
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

			{user.user_role === "customer" && !showForm && (
				<View style={styles.buttonContainer}>
					<Button title="🛠️ Make something done" onPress={() => setShowForm(true)} />
				</View>
			)}

			<View style={{ marginTop: 20 }}>
				{(user.user_role === "worker" || user.user_role === "customer") &&
					tasks.map((task, i) => <TaskCard key={i} task={task} username={task.username} onPress={() => navigation.navigate("taskDetails", { task })} />)}
			</View>
			{showForm && (
				<TaskForm
					title={title}
					setTitle={setTitle}
					description={description}
					setDescription={setDescription}
					price={price}
					setPrice={setPrice}
					place={place}
					setPlace={setPlace}
					day={day}
					setDay={setDay}
					timeOfDay={timeOfDay}
					setTimeOfDay={setTimeOfDay}
					jobType={jobType}
					setJobType={setJobType}
					onCancel={() => {
						setShowForm(false);
						setMessage(null);
						setMessageType(null);
					}}
					onSubmit={handleSubmit}
				/>
			)}

			{message && (
				<View style={[styles.messageBox, messageType === "error" ? styles.errorBox : styles.successBox]}>
					<Text style={[styles.messageText, messageType === "error" ? styles.errorText : styles.successText]}>{message}</Text>
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#f0f8ff",
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	center: {
		flex: 1,
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
		fontSize: 18,
		color: "#00509e",
		fontWeight: "600",
		marginTop: 12,
		marginBottom: 6,
	},
	value: {
		fontSize: 18,
		color: "#333",
	},
	messageBox: {
		marginTop: 20,
		padding: 12,
		borderRadius: 6,
	},
	errorBox: {
		backgroundColor: "#f8d7da",
		borderColor: "#f5c2c7",
		borderWidth: 1,
	},
	successBox: {
		backgroundColor: "#d1e7dd",
		borderColor: "#badbcc",
		borderWidth: 1,
	},
	messageText: {
		fontSize: 16,
	},
	errorText: {
		color: "#842029",
	},
	successText: {
		color: "#0f5132",
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
	buttonContainer: {
		marginTop: 20,
	},
});
