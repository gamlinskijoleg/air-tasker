import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import axios from "axios";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { TaskForm } from "./components/TaskForm";
import { useUserContext } from "../context/UserContext";
import { useFocusEffect } from "@react-navigation/native";

export type FormState = {
	price: string;
	place: string;
	title: string;
	message: string | null;
	messageType: "error" | "success" | null;
	timeOfDay: string;
	jobType: string;
	description: string;
	day: string;
};

export default function DashboardScreen() {
	const { user, refetch } = useCurrentUser("");
	const { token } = useUserContext();
	const [showForm, setShowForm] = useState(false);
	const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
	const [formState, setFormState] = useState<FormState>({
		price: "",
		place: "",
		title: "",
		message: null,
		messageType: null,
		timeOfDay: "Morning",
		jobType: "Gardening",
		description: "",
		day: "",
	});

	const updateFormState = (field: keyof FormState, value: any) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	useFocusEffect(
		useCallback(() => {
			refetch();
		}, [refetch])
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowTimeoutMessage(true);
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	const handleSubmit = async () => {
		if (!token) {
			updateFormState("message", "Token is missing. Please log in again.");
			updateFormState("messageType", "error");
			return;
		}
		try {
			await axios.post(
				"http://localhost:3000/tasks/create",
				{
					who_made_username: user?.username,
					title: formState.title,
					description: formState.description,
					price: Number(formState.price),
					place: formState.place,
					day: formState.day,
					time: formState.timeOfDay,
					type: formState.jobType,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			updateFormState("message", "Task created successfully!");
			updateFormState("messageType", "success");
			setShowForm(false);

			setFormState((prev) => ({
				...prev,
				price: "",
				place: "",
				title: "",
				timeOfDay: "Morning",
				jobType: "Gardening",
				description: "",
				day: "",
			}));
		} catch (err: any) {
			const msg = err.response?.data?.error || "Error creating task";
			updateFormState("message", msg);
			updateFormState("messageType", "error");
		}
	};

	if (!user) {
		if (!showTimeoutMessage) {
			return (
				<View style={[styles.container, styles.center]}>
					<ActivityIndicator size="large" color="#00509e" />
				</View>
			);
		} else {
			return (
				<View style={[styles.container, styles.center]}>
					<Text style={styles.notFoundText}>User not found</Text>
					<TouchableOpacity style={styles.retryButton} onPress={refetch}>
						<Text style={styles.retryButtonText}>Try again</Text>
					</TouchableOpacity>
				</View>
			);
		}
	}

	return (
		<ScrollView contentContainerStyle={[styles.container, { flexGrow: 1, padding: 0, margin: 0 }]} style={{ padding: 0, margin: 0, backgroundColor: "#fff" }}>
			<View style={styles.logoHeader}>
				<Text style={styles.logoText}>airtasker</Text>
			</View>

			<View style={styles.topSection}>
				<Text style={styles.headerText}>Hello, {user.username ?? user.email}</Text>
				<Text style={styles.helloText}>Need Help? Get it done.</Text>
				<Text style={[styles.helloText, { marginBottom: 10 }]}>Your current role: {user.user_role}</Text>

				{user.user_role === "customer" && !showForm && (
					<TouchableOpacity style={styles.getDoneButton} onPress={() => setShowForm(true)}>
						<Text style={styles.getDoneButtonText}>Get Something Done</Text>
					</TouchableOpacity>
				)}
			</View>

			<View style={{ padding: 20, margin: 0, backgroundColor: "#fff" }}>
				{showForm && (
					<TaskForm
						formState={formState}
						setFormState={setFormState}
						onCancel={() => {
							setShowForm(false);
							setFormState((prev) => ({ ...prev, message: null, messageType: null }));
						}}
						onSubmit={handleSubmit}
					/>
				)}

				{formState.message && (
					<View style={[styles.messageBox, formState.messageType === "error" ? styles.errorBox : styles.successBox]}>
						<Text style={[styles.messageText, formState.messageType === "error" ? styles.errorText : styles.successText]}>{formState.message}</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	logoHeader: {
		backgroundColor: "#012333",
		paddingVertical: 50,
		paddingHorizontal: 40,
		alignItems: "flex-start",
		marginBottom: 20,
	},

	logoText: {
		fontSize: 28,
		fontWeight: "900",
		color: "#50FFA1",
		textTransform: "uppercase",
		letterSpacing: 2,
		textAlign: "left",
	},

	topSection: {
		marginBottom: 30,
		alignItems: "center",
	},

	helloText: {
		fontSize: 20,
		color: "#012333",
		fontWeight: "400",
		marginBottom: 2,
	},

	headerText: {
		fontSize: 26,
		fontWeight: "900",
		color: "#012333",
		textAlign: "center",
		marginBottom: 20,
	},

	getDoneButton: {
		backgroundColor: "#50FFA1",
		paddingVertical: 16,
		paddingHorizontal: 30,
		borderRadius: 12,
		shadowColor: "#50FFA1",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 12,
	},

	getDoneButtonText: {
		color: "#012333",
		fontSize: 20,
		fontWeight: "900",
		letterSpacing: 1,
	},

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
});
