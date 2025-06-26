import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { Task } from "../../App";

interface AppliedTaskCardProps {
	task: Task;
	bidPrice: number;
	username?: string;
	onPress?: () => void;
}

export const AppliedTaskCard = ({ task, bidPrice, username, onPress }: AppliedTaskCardProps) => {
	const getStatusColor = () => {
		switch (task.status) {
			case "Open":
				return "#2a9d8f";
			case "Canceled":
				return "#e76f51";
			case "Assigned":
				return "#f4a261";
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

					<Text style={[styles.status, { color: getStatusColor() }]}>{task.status}</Text>

					{task.description && (
						<Text style={styles.description} numberOfLines={3}>
							{task.description}
						</Text>
					)}

					{typeof task.applicationsCount === "number" && (
						<View style={styles.infoRow}>
							<MaterialCommunityIcons name="account-multiple-outline" size={18} color="#555" />
							<Text style={styles.infoText}>
								{task.applicationsCount} {task.applicationsCount === 1 ? "заявка" : "заявок"}
							</Text>
						</View>
					)}
				</View>

				<View style={styles.rightSide}>
					<View style={styles.priceRow}>
						<MaterialCommunityIcons name="cash" size={20} color="#00509e" />
						<Text style={styles.price}>{task.price} $</Text>
					</View>

					<View style={{ marginTop: 6 }}>
						<Text style={{ fontWeight: "600", color: "#2a9d8f" }}>Ваша ставка: {bidPrice} $</Text>
					</View>

					{username && <Text>Created by: {username}</Text>}

					<MaterialCommunityIcons style={{ marginTop: 10 }} name="account-circle" size={45} color="#777" />
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
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
	card: {
		flexDirection: "row",
		backgroundColor: "#012333",
		marginBottom: 14,
		padding: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
		borderLeftWidth: 5,
		borderLeftColor: "#50FFA1",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},

	leftSide: {
		flex: 1,
	},

	header: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 8,
	},

	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},

	infoText: {
		fontSize: 15,
		color: "#fff",
		marginLeft: 6,
	},

	status: {
		fontWeight: "600",
		marginTop: 8,
		fontSize: 15,
		color: "#50FFA1",
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
		color: "#fff",
		marginLeft: 6,
	},

	description: {
		marginTop: 8,
		fontSize: 14,
		color: "#fff",
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
