import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../App";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { AppliedTaskCard } from "./components/AppliedTaskCard";

type Props = BottomTabScreenProps<MainTabsParamList, "dashboard">;

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Done"];
const JOB_TYPE_OPTIONS = ["All", "Gardening", "Cleaning", "Moving", "Other"];
const DAY_OPTIONS = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DashboardScreen({ route }: Props) {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user, token } = useUserContext();
	const [tasks, setTasks] = useState<any[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [price, setPrice] = useState("");
	const [place, setPlace] = useState("");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"error" | "success" | null>(null);
	const [timeOfDay, setTimeOfDay] = useState<string>("Morning");
	const [jobType, setJobType] = useState<string>("Gardening");
	const [description, setDescription] = useState("");
	const [appliedTasks, setAppliedTasks] = useState<any[]>([]);
	const [loadingBids, setLoadingBids] = useState(false);
	const [day, setDay] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("All");
	const [filterJobType, setFilterJobType] = useState<string>("All");
	const [filterDay, setFilterDay] = useState<string>("All");

	const fetchTasks = useCallback(() => {
		if (!user) return;
		const url = user.user_role === "worker" ? "http://localhost:3000/tasks" : `http://localhost:3000/tasks/user/${user.id}`;
		axios
			.get(url)
			.then((res: any) => setTasks(res.data.tasks))
			.catch((err) => {
				console.error("Error loading tasks", err);
				setMessage("Помилка завантаження завдань");
				setMessageType("error");
			});
	}, [user]);

	const fetchAppliedTasks = useCallback(() => {
		if (!user) return;
		setLoadingBids(true);
		axios
			.get(`http://localhost:3000/tasks/bids/${user.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res: any) => {
				setAppliedTasks(res.data);
				setLoadingBids(false);
			})
			.catch((err) => {
				setMessageType("error");
				setLoadingBids(false);
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

	const handleSubmit = async () => {
		try {
			await axios.post(
				"http://localhost:3000/tasks/create",
				{
					title,
					description,
					price: Number(price),
					place,
					day: filterDay === "All" ? "" : filterDay,
					time: timeOfDay,
					type: jobType,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			setMessage("Завдання успішно створено!");
			setMessageType("success");
			setShowForm(false);
			setPrice("");
			setPlace("");
			setTitle("");
			setTimeOfDay("Morning");
			setJobType("Gardening");
			fetchTasks();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Помилка створення завдання";
			setMessage(msg);
			setMessageType("error");
		}
	};

	if (!user) {
		return (
			<View style={[styles.container, styles.center]}>
				<Text style={styles.notFoundText}>Користувача не знайдено</Text>
				<TouchableOpacity style={styles.retryButton} onPress={() => {}}>
					<Text style={styles.retryButtonText}>Спробувати знову</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const filteredTasks = tasks
		.filter((task) => (user.user_role === "worker" ? !appliedTasks.some((applied) => applied.task.id === task.id) : true))
		.filter((task) => filterStatus === "All" || task.status === filterStatus)
		.filter((task) => filterJobType === "All" || task.type === filterJobType)
		.filter((task) => filterDay === "All" || task.day === filterDay);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Dashboard</Text>

			<View style={styles.infoCard}>
				<Text style={styles.label}>Email</Text>
				<Text style={styles.value}>{user.email}</Text>

				<Text style={[styles.label, { marginTop: 12 }]}>Роль</Text>
				<Text style={styles.value}>{user.user_role}</Text>
			</View>

			{user.user_role === "customer" ? (
				<View style={[styles.roleBox, styles.customerBox]}>
					<Text style={styles.roleText}>Ласкаво просимо, клієнте!</Text>
					<Text style={styles.roleSubText}>Ви можете шукати виконавців та створювати завдання.</Text>
				</View>
			) : user.user_role === "worker" ? (
				<View style={[styles.roleBox, styles.workerBox]}>
					<Text style={styles.roleText}>Вітаємо, працівнику!</Text>
					<Text style={styles.roleSubText}>Перегляньте доступні завдання та подавайте заявки.</Text>
				</View>
			) : (
				<Text style={styles.warning}>Невідома роль користувача</Text>
			)}

			{user.user_role === "worker" && (
				<View style={styles.appliedTasksSection}>
					<Text style={styles.sectionTitle}>Заявки, на які ви подали</Text>
					{loadingBids ? (
						<Text style={styles.loadingText}>Завантаження заявок...</Text>
					) : appliedTasks.length === 0 ? (
						<Text style={styles.emptyText}>Ви ще не подавали заявки</Text>
					) : (
						appliedTasks.map(({ task, bid_price }) => (
							<AppliedTaskCard
								key={task.id}
								task={task}
								bidPrice={bid_price}
								username={task.username}
								onPress={() => navigation.navigate("taskDetails", { task, appliedTasks })}
							/>
						))
					)}
				</View>
			)}

			{user.user_role === "customer" && !showForm && (
				<TouchableOpacity style={styles.primaryButton} onPress={() => setShowForm(true)}>
					<Text style={styles.primaryButtonText}>🛠️ Make something done</Text>
				</TouchableOpacity>
			)}

			{/* Filters Section */}
			<View style={styles.filtersContainer}>
				<Text style={styles.filterLabel}>Status:</Text>
				<View style={styles.filterButtonsRow}>
					{STATUS_OPTIONS.map((status) => (
						<TouchableOpacity key={status} style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]} onPress={() => setFilterStatus(status)}>
							<Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>{status}</Text>
						</TouchableOpacity>
					))}
				</View>

				<Text style={[styles.filterLabel, { marginTop: 12 }]}>Job Type:</Text>
				<View style={styles.filterButtonsRow}>
					{JOB_TYPE_OPTIONS.map((type) => (
						<TouchableOpacity key={type} style={[styles.filterButton, filterJobType === type && styles.filterButtonActive]} onPress={() => setFilterJobType(type)}>
							<Text style={[styles.filterButtonText, filterJobType === type && styles.filterButtonTextActive]}>{type}</Text>
						</TouchableOpacity>
					))}
				</View>

				<Text style={[styles.filterLabel, { marginTop: 12 }]}>Day:</Text>
				<View style={styles.filterButtonsRow}>
					{DAY_OPTIONS.map((dayOption) => (
						<TouchableOpacity
							key={dayOption}
							style={[styles.filterButton, filterDay === dayOption && styles.filterButtonActive]}
							onPress={() => setFilterDay(dayOption)}
						>
							<Text style={[styles.filterButtonText, filterDay === dayOption && styles.filterButtonTextActive]}>{dayOption}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View style={styles.tasksSection}>
				<Text style={styles.sectionTitle}>Всі заявки</Text>
				{filteredTasks.length === 0 ? (
					<Text style={styles.emptyText}>Завдань не знайдено</Text>
				) : (
					filteredTasks.map((task) => (
						<TaskCard key={task.id} task={task} username={task.username} onPress={() => navigation.navigate("taskDetails", { task, appliedTasks })} />
					))
				)}
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
		backgroundColor: "#fff",
		paddingHorizontal: 24,
		paddingVertical: 30,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 36,
		fontWeight: "900",
		color: "#012333",
		marginBottom: 30,
		textAlign: "center",
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	infoCard: {
		backgroundColor: "#f0f8f5",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#50FFA1",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 10,
		marginBottom: 24,
	},
	label: {
		fontSize: 18,
		color: "#012333",
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.7,
	},
	value: {
		fontSize: 18,
		color: "#012333",
		marginTop: 6,
		fontWeight: "600",
	},
	roleBox: {
		borderRadius: 16,
		paddingVertical: 24,
		paddingHorizontal: 30,
		marginBottom: 30,
		shadowColor: "#50FFA1",
		shadowOpacity: 0.2,
		shadowRadius: 18,
		elevation: 8,
	},
	customerBox: {
		backgroundColor: "#e6fff6",
	},
	workerBox: {
		backgroundColor: "#d1e8ff",
	},
	roleText: {
		fontSize: 24,
		fontWeight: "900",
		color: "#012333",
		marginBottom: 8,
		letterSpacing: 0.8,
	},
	roleSubText: {
		fontSize: 17,
		color: "#025973",
		lineHeight: 24,
		fontWeight: "600",
	},
	warning: {
		marginTop: 20,
		color: "#b22222",
		fontSize: 18,
		textAlign: "center",
		fontWeight: "700",
	},
	appliedTasksSection: {
		marginTop: 30,
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 30,
		fontWeight: "900",
		color: "#012333",
		marginBottom: 18,
		borderBottomWidth: 2,
		borderBottomColor: "#50FFA1",
		paddingBottom: 6,
	},
	loadingText: {
		color: "#555",
		fontStyle: "italic",
		fontSize: 16,
	},
	emptyText: {
		fontSize: 16,
		color: "#777",
		fontStyle: "italic",
	},
	primaryButton: {
		backgroundColor: "#50FFA1",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		marginVertical: 20,
		shadowColor: "#50FFA1",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 12,
	},
	primaryButtonText: {
		color: "#012333",
		fontSize: 20,
		fontWeight: "900",
		letterSpacing: 1,
	},
	tasksSection: {
		marginTop: 10,
		marginBottom: 40,
	},
	messageBox: {
		marginTop: 20,
		padding: 16,
		borderRadius: 16,
		shadowColor: "#50FFA1",
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	errorBox: {
		backgroundColor: "#fdecea",
		borderColor: "#f5c6cb",
		borderWidth: 1,
	},
	successBox: {
		backgroundColor: "#d4edda",
		borderColor: "#c3e6cb",
		borderWidth: 1,
	},
	messageText: {
		fontSize: 18,
		fontWeight: "700",
	},
	errorText: {
		color: "#a71d2a",
	},
	successText: {
		color: "#155724",
	},
	notFoundText: {
		fontSize: 22,
		color: "#a71d2a",
		fontWeight: "700",
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: "#50FFA1",
		paddingVertical: 14,
		paddingHorizontal: 36,
		borderRadius: 12,
		shadowColor: "#2ca678",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 10,
	},
	retryButtonText: {
		color: "#012333",
		fontWeight: "900",
		fontSize: 18,
	},
	filtersContainer: {
		marginBottom: 20,
	},
	filterLabel: {
		fontWeight: "700",
		color: "#012333",
		fontSize: 18,
		marginBottom: 6,
	},
	filterButtonsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
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
});
