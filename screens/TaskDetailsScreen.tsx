import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from "react-native";
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
		console.log(token);

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
			Alert.alert("Success", "Worker assigned!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Error assigning worker";
			Alert.alert("Error", msg);
		}
	};

	const markTaskAsUndone = async () => {
		try {
			setLoading(true);
			await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/reopen`, {}, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Success", "Task has been reopened!");
			setCurrentTask({ ...currentTask, status: "Open", who_took: null });
		} catch (err: any) {
			if (err.response?.status === 403) {
				Alert.alert("Error", "You do not have permission for this operation");
			} else {
				const msg = err.response?.data?.error || "Failed to change task status";
				Alert.alert("Error", msg);
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
			Alert.alert("Deleted", "Task deleted successfully!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Error deleting task";
			Alert.alert("Error", msg);
		}
	};

	const applyForTask = async () => {
		if (!bidPrice || Number(bidPrice) <= 0) {
			Alert.alert("Error", "Please enter a valid bid amount.");
			return;
		}
		try {
			setLoading(true);
			await axios.post(`http://localhost:3000/tasks/apply/${currentTask.id}`, { bid_price: Number(bidPrice) }, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Success", "You have successfully applied for the task!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Failed to apply for the task";
			Alert.alert("Error", msg);
		} finally {
			setLoading(false);
		}
	};

	const markTaskAsDone = async () => {
		try {
			setLoading(true);
			await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
			Alert.alert("Success", "Task marked as completed!");
			navigation.goBack();
		} catch (err: any) {
			const msg = err.response?.data?.error || "Failed to mark task as completed";
			Alert.alert("Error", msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
			<Text>{JSON.stringify(currentTask, null, 2)}</Text>
			<Text style={styles.header}>{currentTask.title}</Text>

			<View style={styles.infoSection}>
				<InfoRow label="Posted by" value={`${task.who_made_username}`} />
				<InfoRow label="Location" value={currentTask.place} />
				<InfoRow label="Target Date" value={`${currentTask.day} ${currentTask.time}`} />
				<InfoRow label="Original Bid" value={`${currentTask.price} $`} />
			</View>

			{currentTask.description ? (
				<View style={styles.detailsSection}>
					<Text style={styles.detailsHeader}>Details</Text>
					<Text style={styles.detailsText}>{currentTask.description}</Text>
				</View>
			) : null}

			{user?.user_role === "customer" && (
				<>
					<Text style={styles.sectionTitle}>Applications for this task</Text>

					{applications.length === 0 ? (
						<Text style={styles.emptyText}>No applications currently.</Text>
					) : (
						applications.map((app, i) => (
							<View key={i} style={styles.applicationCard}>
								<View style={styles.applicationInfo}>
									<Text style={styles.applicationUsername}>{app.username}</Text>
									<Text style={styles.applicationBid}>{app.bid_price} $</Text>
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
								text="Confirm completion"
								onPress={async () => {
									try {
										await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
										Alert.alert("Success", "Task confirmed as completed!");
										setCurrentTask({ ...currentTask, status: "Completed" });
									} catch {
										Alert.alert("Error", "Failed to confirm completion");
									}
								}}
								backgroundColor="#2f9e44"
							/>
							<ActionButton
								text="Cancel task"
								onPress={async () => {
									try {
										await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
										Alert.alert("Success", "Task canceled");
										setCurrentTask({ ...currentTask, status: "Canceled" });
									} catch {
										Alert.alert("Error", "Failed to cancel task");
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
								text="Cancel assignment"
								onPress={async () => {
									try {
										await axios.patch(`http://localhost:3000/tasks/${currentTask.id}/unassign`, {}, { headers: { Authorization: `Bearer ${token}` } });
										Alert.alert("Success", "Assignment canceled");
										setCurrentTask({ ...currentTask, status: "Open", who_took: null });
									} catch {
										Alert.alert("Error", "Failed to cancel assignment");
									}
								}}
								backgroundColor="#e63946"
							/>
						</View>
					)}

					<View style={{ marginTop: 30 }}>
						<ActionButton text="Delete task" onPress={deleteTask} backgroundColor="#b02a37" />
					</View>
				</>
			)}

			{user?.user_role === "worker" && (
				<>
					{noBiddingStatuses.includes(currentTask.status) ? (
						<Text style={styles.emptyText}>No more bids can be placed on this task.</Text>
					) : isAssignedToUser ? (
						<>
							<ActionButton text={loading ? "Please wait..." : "Mark as completed"} onPress={markTaskAsDone} disabled={loading} backgroundColor="#2f9e44" />
							<ActionButton
								text={loading ? "Please wait..." : "Mark as not completed"}
								onPress={markTaskAsUndone}
								disabled={loading}
								backgroundColor="#e07a5f"
								style={{ marginTop: 12 }}
							/>
						</>
					) : !hasApplied ? (
						<>
							<Text style={styles.bidLabel}>Your bid (UAH):</Text>
							<TextInput
								style={styles.bidInput}
								keyboardType="numeric"
								value={bidPrice}
								onChangeText={setBidPrice}
								placeholder="Enter amount"
								placeholderTextColor="#888"
							/>
							<ActionButton text={loading ? "Submitting..." : "Apply for task"} onPress={applyForTask} disabled={loading} backgroundColor="#2a9d8f" />
						</>
					) : (
						<Text style={styles.emptyText}>You have already applied for this task.</Text>
					)}
				</>
			)}
		</ScrollView>
	);
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<View style={styles.infoRow}>
		<Text style={styles.infoLabel}>{label}:</Text>
		<Text style={styles.infoValue}>{value}</Text>
	</View>
);

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
	sectionTitle: {
		fontSize: 19,
		fontWeight: "700",
		marginBottom: 12,
		color: "#2c3a7d",
	},
	header: {
		fontSize: 28,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 30,
		color: "#222f3e",
	},
	infoSection: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		marginBottom: 25,
		shadowColor: "#0a2342",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 5,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	infoLabel: {
		fontWeight: "600",
		fontSize: 16,
		color: "#3b4a6b",
	},
	infoValue: {
		fontSize: 16,
		color: "#1a2238",
		maxWidth: "65%",
		textAlign: "right",
	},
	detailsSection: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		shadowColor: "#0a2342",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	detailsHeader: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 12,
		color: "#2c3a7d",
	},
	detailsText: {
		fontSize: 16,
		color: "#374151",
		lineHeight: 24,
		letterSpacing: 0.3,
	},
	container: {
		flex: 1,
		backgroundColor: "#f2f6fc",
		paddingHorizontal: 20,
		paddingTop: 25,
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
	emptyText: {
		fontSize: 15,
		fontStyle: "italic",
		color: "#7a7a7a",
		marginTop: 6,
		marginBottom: 15,
		textAlign: "center",
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
