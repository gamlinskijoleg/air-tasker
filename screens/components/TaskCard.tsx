import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface TaskCardProps {
	task: {
		id: string;
		who_made_id: string;
		price: number;
		place: string;
		day: string;
		time: string;
		is_taken: boolean;
		who_took: string | null;
		is_open: boolean;
		type: string;
		title: string;
		status: "Open" | "Canceled" | "Assigned";
	};
}

export const TaskCard = ({ task }: TaskCardProps) => {
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
		<View style={styles.card}>
			{/* Ліва частина */}
			<View style={styles.leftSide}>
				<Text style={styles.header}>{task.type}</Text>

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
			</View>

			{/* Права частина */}
			<View style={styles.rightSide}>
				<View style={styles.priceRow}>
					<MaterialCommunityIcons name="cash" size={20} color="#00509e" />
					<Text style={styles.price}>{task.price} $</Text>
				</View>

				<MaterialCommunityIcons name="account-circle" size={30} color="#777" />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		backgroundColor: "#f9f9ff",
		marginBottom: 14,
		padding: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		borderLeftWidth: 4,
		borderLeftColor: "#6c63ff",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},

	leftSide: {
		flex: 1,
	},

	header: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},

	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},

	infoText: {
		fontSize: 15,
		color: "#555",
		marginLeft: 6,
	},

	status: {
		fontWeight: "600",
		marginTop: 8,
		fontSize: 15,
	},

	rightSide: {
		alignItems: "flex-end",
		justifyContent: "space-between",
		height: 80,
	},

	priceRow: {
		flexDirection: "row",
		alignItems: "center",
	},

	price: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#00509e",
		marginLeft: 6,
	},
});
