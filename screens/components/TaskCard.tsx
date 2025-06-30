import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { Task } from "../../App";

interface TaskCardProps {
	task: Task;
	onPress?: () => void;
}

export const TaskCard = ({ task, onPress }: TaskCardProps) => {
	const getStatusColor = () => {
		switch (task.status) {
			case "Open":
				return "#2a9d8f";
			case "Canceled":
				return "#e76f51";
			case "Assigned":
				return "#f4a261";
			case "Completed":
				return "#4caf50";
			default:
				return "#555";
		}
	};

	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
			<View style={styles.card}>
				<View style={styles.leftSide}>
					<Text style={styles.header}>{task.title}</Text>

					<View style={styles.infoRow}>
						<MaterialCommunityIcons name="map-marker" size={18} color="#555" />
						<Text style={styles.infoText}>{task.place}</Text>
					</View>

					<View style={styles.infoRow}>
						<MaterialCommunityIcons name="calendar" size={18} color="#555" />
						<Text style={styles.infoText}>{task.day}</Text>
					</View>

					<View style={styles.infoRow}>
						<MaterialCommunityIcons name="clock-outline" size={18} color="#555" />
						<Text style={styles.infoText}>{task.time}</Text>
					</View>

					<View style={styles.statusApplicationsRow}>
						<Text style={[styles.status, { color: getStatusColor() }]}>{task.status}</Text>

						{typeof task.applicationsCount === "number" && (
							<View style={styles.applicationsInfoRow}>
								<MaterialCommunityIcons name="account-multiple-outline" size={18} color="#555" />
								<Text style={styles.infoText}>
									{task.applicationsCount} {task.applicationsCount === 1 ? "application" : "applications"}
								</Text>
							</View>
						)}
					</View>
				</View>

				<View style={styles.rightSide}>
					<View style={styles.priceRow}>
						<MaterialCommunityIcons name="cash" size={20} color="#00509e" />
						<Text style={styles.price}>{task.price} $</Text>
					</View>
					<Text style={styles.description}>Created by: {task.who_made_username || "Unknown"}</Text>

					<MaterialCommunityIcons style={{ marginTop: 10 }} name="account-circle" size={45} color="#777" />
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	statusApplicationsRow: {
		flexDirection: "row",
		alignItems: "center",
	},

	applicationsInfoRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 12,
	},

	card: {
		flexDirection: "row",
		backgroundColor: "#F0F0F0",
		marginBottom: 14,
		padding: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
		justifyContent: "space-between",
		alignItems: "flex-start",
	},

	leftSide: {
		flex: 1,
	},

	header: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#012333",
		marginBottom: 10,
	},

	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},

	infoText: {
		fontSize: 15,
		color: "#3E4A50",
		marginLeft: 6,
	},

	status: {
		fontWeight: "600",
		fontSize: 15,
		color: "#012333",
	},

	description: {
		fontSize: 14,
		color: "#3E4A50",
		marginBottom: 10,
	},

	rightSide: {
		alignItems: "flex-end",
		justifyContent: "space-between",
		height: 110,
	},

	priceRow: {
		flexDirection: "row",
		alignItems: "center",
	},

	price: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#012333",
		marginLeft: 6,
	},

	deleteButton: {
		marginTop: 10,
		paddingHorizontal: 10,
		paddingVertical: 5,
		backgroundColor: "#e63946",
		borderRadius: 5,
	},

	deleteText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 14,
		textAlign: "center",
	},

	markDoneButton: {
		marginTop: 10,
		backgroundColor: "#50FFA1",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
	},

	markDoneText: {
		color: "#012333",
		fontWeight: "600",
	},
});
