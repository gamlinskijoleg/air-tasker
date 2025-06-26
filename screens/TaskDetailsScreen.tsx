import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
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
	const { task, appliedTasks } = route.params;
	const { token, user } = useUserContext();
	const navigation = useNavigation();

	const [loading, setLoading] = useState(false);
	const [bidPrice, setBidPrice] = useState<string>("");
	const [applications, setApplications] = useState<any[]>([]);
	const [currentTask, setCurrentTask] = useState(task);
	const [isAssignedToUser, setIsAssignedToUser] = useState(false);
	const [hasApplied, setHasApplied] = useState(false);

	const noBiddingStatuses = ["Canceled", "Done", "Completed"];

	useEffect(() => {
		if (!task?.id) return;
		axios
			.get(`http://localhost:3000/tasks/${task.id}/details`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res: any) => setCurrentTask(res.data.task))
			.catch(console.error);
	}, [task?.id, token]);

	useEffect(() => {
		if (!currentTask?.id || !user) return;

		setIsAssignedToUser(currentTask.who_took === user.id && (currentTask.status === "Assigned" || currentTask.status === "Done"));
		setHasApplied(appliedTasks?.some((t: any) => t.id === currentTask.id) ?? false);

		if (user.user_role === "customer") {
			axios
				.get(`http://localhost:3000/tasks/${currentTask.id}/applications`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((res: any) => setApplications(res.data))
				.catch(console.error);
		}
	}, [currentTask, user, appliedTasks, token]);

	const assignWorker = async (workerId: string) => {
		try {
			await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/assign`, { user_id: workerId }, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Успіх", "Працівника призначено!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Помилка при призначенні";
			Alert.alert("Помилка", msg);
		}
	};

	const markTaskAsUndone = async () => {
		try {
			setLoading(true);
			await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/reopen`, {}, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Успіх", "Завдання повернуто до статусу відкритого!");
			setCurrentTask({ ...currentTask, status: "Open", who_took: null });
		} catch (err: any) {
			if (err.response?.status === 403) {
				Alert.alert("Помилка", "Ви не маєте прав для цієї операції");
			} else {
				const msg = err.response?.data?.error || "Не вдалося змінити статус завдання";
				Alert.alert("Помилка", msg);
			}
		} finally {
			setLoading(false);
		}
	};

	const deleteTask = async () => {
		try {
			await axios.delete(`http://localhost:3000/tasks/${currentTask.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			Alert.alert("Видалено", "Завдання видалено успішно!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Помилка при видаленні";
			Alert.alert("Помилка", msg);
		}
	};

	const applyForTask = async () => {
		if (!bidPrice || Number(bidPrice) <= 0) {
			Alert.alert("Помилка", "Введіть коректну суму ставки.");
			return;
		}
		try {
			setLoading(true);
			await axios.post(`http://localhost:3000/tasks/apply/${currentTask.id}`, { bid_price: Number(bidPrice) }, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Успіх", "Ви успішно подалися на завдання!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Не вдалося податись на завдання";
			Alert.alert("Помилка", msg);
		} finally {
			setLoading(false);
		}
	};

	const markTaskAsDone = async () => {
		try {
			setLoading(true);
			await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Успіх", "Завдання позначено як виконане!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Не вдалося позначити як виконане";
			Alert.alert("Помилка", msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
			<Text style={styles.title}>{currentTask.title}</Text>

			<View style={styles.infoBox}>
				<DetailRow icon="briefcase-outline" label="Тип" value={currentTask.type} />
				<DetailRow icon="map-marker" label="Місце" value={currentTask.place} />
				<DetailRow icon="cash" label="Ціна" value={`${currentTask.price} грн`} />
				<DetailRow icon="calendar" label="Дата" value={currentTask.day} />
				<DetailRow icon="clock-outline" label="Час" value={currentTask.time} />
				<DetailRow icon="information-outline" label="Статус" value={currentTask.status} color={getStatusColor(currentTask.status)} />
			</View>

			{!!currentTask.description && (
				<View style={styles.descriptionBox}>
					<Text style={styles.descriptionLabel}>Опис:</Text>
					<Text style={styles.descriptionText}>{currentTask.description}</Text>
				</View>
			)}

			{user?.user_role === "customer" && (
				<>
					<Text style={styles.sectionTitle}>Заявки на це завдання</Text>

					{applications.length === 0 ? (
						<Text style={styles.emptyText}>Поки що немає заявок.</Text>
					) : (
						applications.map((app, i) => (
							<View key={i} style={styles.applicationCard}>
								<View style={styles.applicationInfo}>
									<Text style={styles.applicationUsername}>{app.username}</Text>
									<Text style={styles.applicationBid}>💸 {app.bid_price} грн</Text>
								</View>
								<TouchableOpacity style={styles.assignButton} onPress={() => assignWorker(app.user_id)}>
									<MaterialCommunityIcons name="check-circle-outline" size={28} color="#2a9d8f" />
								</TouchableOpacity>
							</View>
						))
					)}

					{currentTask.status === "Done" && (
						<View style={styles.customerActions}>
							<ActionButton
								text="Підтвердити виконання"
								onPress={async () => {
									try {
										await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
										Alert.alert("Успіх", "Завдання підтверджено як виконане!");
										setCurrentTask({ ...currentTask, status: "Completed" });
									} catch {
										Alert.alert("Помилка", "Не вдалося підтвердити виконання");
									}
								}}
								backgroundColor="#2f9e44"
							/>
							<ActionButton
								text="Скасувати завдання"
								onPress={async () => {
									try {
										await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
										Alert.alert("Успіх", "Завдання скасовано");
										setCurrentTask({ ...currentTask, status: "Canceled" });
									} catch {
										Alert.alert("Помилка", "Не вдалося скасувати завдання");
									}
								}}
								backgroundColor="#e63946"
								style={{ marginTop: 12 }}
							/>
						</View>
					)}

					{currentTask.status === "Assigned" && (
						<View style={styles.customerActions}>
							<ActionButton
								text="Скасувати призначення"
								onPress={async () => {
									try {
										await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/unassign`, {}, { headers: { Authorization: `Bearer ${token}` } });
										Alert.alert("Успіх", "Призначення скасовано");
										setCurrentTask({ ...currentTask, status: "Open", who_took: null });
									} catch {
										Alert.alert("Помилка", "Не вдалося скасувати призначення");
									}
								}}
								backgroundColor="#e63946"
							/>
						</View>
					)}

					<View style={{ marginTop: 30 }}>
						<ActionButton text="  Видалити завдання" onPress={deleteTask} backgroundColor="#b02a37" />
					</View>
				</>
			)}

			{user?.user_role === "worker" && (
				<>
					{noBiddingStatuses.includes(currentTask.status) ? (
						<Text style={styles.emptyText}>На це завдання більше не можна подавати ставки.</Text>
					) : isAssignedToUser ? (
						<>
							<ActionButton text={loading ? "Зачекайте..." : " Позначити як виконане"} onPress={markTaskAsDone} disabled={loading} backgroundColor="#2f9e44" />
							<ActionButton
								text={loading ? "Зачекайте..." : "↩ Позначити як не виконане"}
								onPress={markTaskAsUndone}
								disabled={loading}
								backgroundColor="#e07a5f"
								style={{ marginTop: 12 }}
							/>
						</>
					) : !hasApplied ? (
						<>
							<Text style={styles.bidLabel}>Ваша ставка (грн):</Text>
							<TextInput
								style={styles.bidInput}
								keyboardType="numeric"
								value={bidPrice}
								onChangeText={setBidPrice}
								placeholder="Введіть суму"
								placeholderTextColor="#888"
							/>
							<ActionButton text={loading ? "Подання..." : "Податись на завдання"} onPress={applyForTask} disabled={loading} backgroundColor="#2a9d8f" />
						</>
					) : (
						<Text style={styles.emptyText}>Ви вже подали заявку на це завдання.</Text>
					)}
				</>
			)}
		</ScrollView>
	);
}

const DetailRow = ({ icon, label, value, color = "#333" }: { icon: string; label: string; value: string; color?: string }) => (
	<View style={styles.detailRow}>
		<MaterialCommunityIcons name={icon} size={20} color="#00509e" style={styles.detailIcon} />
		<Text style={styles.detailLabel}>{label}:</Text>
		<Text style={[styles.detailValue, { color }]}>{value}</Text>
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
		case "Completed":
			return "#2f9e44";
		case "Applied":
			return "#a55eea";
		default:
			return "#333";
	}
};

const ActionButton = ({
	text,
	onPress,
	disabled = false,
	backgroundColor = "#2a9d8f",
	style = {},
}: {
	text: string;
	onPress: () => void;
	disabled?: boolean;
	backgroundColor?: string;
	style?: any;
}) => (
	<TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={disabled} style={[styles.actionButton, { backgroundColor: disabled ? "#95aac9" : backgroundColor }, style]}>
		<Text style={styles.actionButtonText}>{text}</Text>
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f2f6fc",
		paddingHorizontal: 20,
		paddingTop: 25,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 25,
		color: "#222f3e",
	},
	infoBox: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 25,
		shadowColor: "#0a2342",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 4,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 14,
	},
	detailIcon: {
		marginRight: 14,
		width: 28,
	},
	detailLabel: {
		fontWeight: "600",
		fontSize: 15,
		color: "#3b4a6b",
		width: 95,
	},
	detailValue: {
		flex: 1,
		fontSize: 15,
		color: "#1a2238",
	},
	descriptionBox: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 30,
		shadowColor: "#0a2342",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.07,
		shadowRadius: 8,
		elevation: 3,
	},
	descriptionLabel: {
		fontWeight: "700",
		fontSize: 17,
		color: "#3b4a6b",
		marginBottom: 8,
	},
	descriptionText: {
		fontSize: 15,
		color: "#374151",
		lineHeight: 24,
		letterSpacing: 0.3,
	},
	sectionTitle: {
		fontSize: 19,
		fontWeight: "700",
		marginBottom: 12,
		color: "#2c3a7d",
	},
	emptyText: {
		fontSize: 15,
		fontStyle: "italic",
		color: "#7a7a7a",
		marginTop: 6,
		marginBottom: 15,
		textAlign: "center",
	},
	applicationCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 20,
		marginBottom: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#071a3f",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 3,
	},
	applicationInfo: {
		flexDirection: "column",
	},
	applicationUsername: {
		fontSize: 16,
		fontWeight: "700",
		color: "#293462",
	},
	applicationBid: {
		fontSize: 14,
		color: "#5c7080",
		marginTop: 4,
	},
	assignButton: {
		padding: 6,
	},
	customerActions: {
		marginTop: 20,
	},
	bidLabel: {
		fontWeight: "600",
		fontSize: 16,
		marginBottom: 10,
		color: "#2a3e66",
	},
	bidInput: {
		backgroundColor: "#ffffff",
		borderColor: "#a3b1c2",
		borderWidth: 1,
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		color: "#222f3e",
		marginBottom: 20,
		shadowColor: "#6c7a97",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	actionButton: {
		paddingVertical: 14,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#1a1f36",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	actionButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
});
