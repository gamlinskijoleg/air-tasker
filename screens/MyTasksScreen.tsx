import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import { TaskCard } from "./components/TaskCard";
import { useFocusEffect } from "@react-navigation/native";

export default function MyTasksScreen() {
	const { user, token } = useUserContext();
	const [tasks, setTasks] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			const fetchTasks = async () => {
				if (!user || user.user_role !== "customer") {
					setTasks([]);
					setLoading(false);
					return;
				}

				setLoading(true);
				setError(null);

				try {
					const res: any = await axios.get(`http://10.0.2.2:3000/tasks/user/${user.id}`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					setTasks(res.data.tasks || []);
				} catch (err) {
					setError("Failed to load your tasks");
					setTasks([]);
				} finally {
					setLoading(false);
				}
			};

			fetchTasks();
		}, [user, token])
	);

	if (!user) {
		return (
			<View style={styles.container}>
				<Text style={styles.text}>User not found</Text>
			</View>
		);
	}

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#50FFA1" />
			</View>
		);
	}

	if (user.user_role !== "customer") {
		return (
			<View style={styles.container}>
				<Text style={styles.header}>My Tasks</Text>
				<Text style={styles.text}>Here you can see all the tasks you’ve been assigned to or applied for.</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.header}>My Tasks</Text>
			{error && <Text style={styles.error}>{error}</Text>}
			{tasks.length === 0 ? <Text style={styles.text}>You haven’t created any tasks yet.</Text> : tasks.map((task) => <TaskCard key={task.id} task={task} />)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "#fff",
	},
	header: {
		fontSize: 28,
		fontWeight: "900",
		marginBottom: 20,
		color: "#012333",
		textAlign: "center",
	},
	text: {
		fontSize: 18,
		color: "#444",
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 10,
	},
	error: {
		color: "#b22222",
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 10,
	},
});
