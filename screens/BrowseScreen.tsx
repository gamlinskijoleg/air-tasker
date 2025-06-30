import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import axios from "axios";
import { TaskCard } from "./components/TaskCard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useUserContext } from "../context/UserContext";

const STATUS_OPTIONS = ["All", "Open", "Canceled", "Assigned", "Done", "Completed", "Applied", "In Progress"];

export default function BrowseScreen() {
	const [tasks, setTasks] = useState<any[]>([]);
	const [filterStatus, setFilterStatus] = useState<string>("All");
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [appliedTasks, setAppliedTasks] = useState<any[]>([]);
	const { user, token } = useUserContext();
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"error" | "success" | null>(null);

	const fetchTasks = useCallback(() => {
		if (!user) return;
		const url = user.user_role === "worker" ? "http://localhost:3000/tasks/all" : `http://localhost:3000/tasks/user/${user.id}`;
		axios
			.get(url)
			.then((res: any) => setTasks(res.data.tasks))
			.catch((err) => {
				console.error("Error loading tasks", err);
				setMessage("Error loading tasks");
				setMessageType("error");
			});
	}, [user]);

	const fetchAppliedTasks = useCallback(() => {
		if (!user) return;
		axios
			.get(`http://localhost:3000/tasks/bids/${user.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res: any) => {
				setAppliedTasks(res.data);
			})
			.catch((err) => {
				console.error("Error loading applied tasks ", err);
				setMessage("Error loading applied tasks");
				setMessageType("error");
			});
	}, [user, token]);

	useFocusEffect(
		useCallback(() => {
			fetchTasks();
			if (user?.user_role === "worker") {
				fetchAppliedTasks();
			}
		}, [fetchTasks, fetchAppliedTasks, user])
	);

	const filteredTasks = tasks.filter((task) => filterStatus === "All" || task.status === filterStatus);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.sectionTitle}>Tasks</Text>

			<View style={styles.filterButtonsRow}>
				{STATUS_OPTIONS.map((status) => (
					<TouchableOpacity key={status} style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]} onPress={() => setFilterStatus(status)}>
						<Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>{status}</Text>
					</TouchableOpacity>
				))}
			</View>

			{filteredTasks.length === 0 ? (
				<Text style={styles.emptyText}>No tasks found</Text>
			) : (
				filteredTasks.map((task) => <TaskCard key={task.id} task={task} onPress={() => navigation.navigate("taskDetails", { task, appliedTasks })} />)
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 20 },
	sectionTitle: {
		fontSize: 30,
		fontWeight: "900",
		color: "#012333",
		marginBottom: 18,
		borderBottomWidth: 2,
		borderBottomColor: "#50FFA1",
		paddingBottom: 6,
	},
	filterButtonsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 20,
	},
	filterButton: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: "#e0e0e0",
		marginRight: 10,
		marginBottom: 10,
	},
	filterButtonActive: {
		backgroundColor: "#50FFA1",
	},
	filterButtonText: {
		color: "#444",
		fontWeight: "600",
	},
	filterButtonTextActive: {
		color: "#012333",
		fontWeight: "900",
	},
	emptyText: {
		fontSize: 16,
		color: "#777",
		fontStyle: "italic",
	},
});
