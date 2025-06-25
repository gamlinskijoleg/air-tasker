import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Button, ScrollView, Platform, StyleSheet } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabsParamList } from "../App";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = BottomTabScreenProps<MainTabsParamList, "dashboard">;

export default function DashboardScreen({ route }: Props) {
	const { user, token, role } = useUserContext();
	const { loading, error, refetch } = useCurrentUser(token);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [day, setDay] = useState(new Date());

	const [showForm, setShowForm] = useState(false);
	const [price, setPrice] = useState("");
	const [place, setPlace] = useState("");

	const [timeOfDay, setTimeOfDay] = useState<"Morning" | "Midday" | "Evening" | "Night">("Morning");
	const [jobType, setJobType] = useState<"Gardening" | "Painting" | "Cleaning" | "Removals" | "Repairs and Installations" | "Copywriting" | "Data Entry" | "Furniture Assembly">(
		"Gardening"
	);

	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"error" | "success" | null>(null);

	useEffect(() => {
		if (error) {
			setMessage(error);
			setMessageType("error");
		}
	}, [error]);

	const handleSubmit = async () => {
		if (!price || !place) {
			setMessage("Будь ласка, заповніть всі поля");
			setMessageType("error");
			return;
		}

		try {
			await axios.post(
				"http://localhost:3000/tasks/create",
				{
					price: Number(price),
					place,
					day: day.toISOString().split("T")[0],
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
			setDay(new Date());
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
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Завантаження...</Text>
			</View>
		);
	}

	if (!user) {
		return (
			<View style={{ padding: 20 }}>
				<Text>Користувача не знайдено</Text>
				<Text>Context data: {JSON.stringify({ user, token, role })}</Text>
				<Button title="Спробувати знову" onPress={refetch} />
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 30 }}>
			<Text style={{ fontSize: 32, fontWeight: "bold", color: "#00509e", marginBottom: 24, textAlign: "center" }}>Dashboard</Text>

			<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>Email:</Text>
			<Text style={{ fontSize: 18, color: "#333" }}>{user.email}</Text>

			<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>Роль:</Text>
			<Text style={{ fontSize: 18, color: "#333" }}>{user.user_role}</Text>

			{user.user_role === "customer" && !showForm && (
				<View style={{ marginTop: 20 }}>
					<Button title="🛠️ Make something done" onPress={() => setShowForm(true)} />
				</View>
			)}

			{showForm && (
				<View style={{ marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 8, elevation: 2 }}>
					<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>💰 Price:</Text>
					<TextInput
						style={{
							backgroundColor: "#eef",
							borderColor: "#00509e",
							borderWidth: 1,
							borderRadius: 6,
							paddingHorizontal: 12,
							paddingVertical: 8,
							marginBottom: 12,
							fontSize: 16,
						}}
						keyboardType="numeric"
						value={price}
						onChangeText={setPrice}
						placeholder="Введіть ціну"
					/>
					<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>📍 Place:</Text>
					<TextInput
						style={{
							backgroundColor: "#eef",
							borderColor: "#00509e",
							borderWidth: 1,
							borderRadius: 6,
							paddingHorizontal: 12,
							paddingVertical: 8,
							marginBottom: 12,
							fontSize: 16,
						}}
						value={place}
						onChangeText={setPlace}
						placeholder="Введіть місце"
					/>
					<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>📆 Day:</Text>
					<TouchableOpacity
						onPress={() => setShowDatePicker(true)}
						style={{
							backgroundColor: "#eef",
							borderColor: "#00509e",
							borderWidth: 1,
							borderRadius: 6,
							paddingHorizontal: 12,
							paddingVertical: 12,
							marginBottom: 12,
						}}
					>
						<Text>{day.toDateString()}</Text>
					</TouchableOpacity>
					{showDatePicker && (
						<DateTimePicker
							value={day}
							mode="date"
							display="default"
							onChange={(event, selectedDate) => {
								setShowDatePicker(false);
								if (selectedDate) {
									setDay(selectedDate);
								}
							}}
						/>
					)}

					<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>🕒 Time of day:</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
						{["Morning", "Midday", "Evening", "Night"].map((time) => (
							<TouchableOpacity
								key={time}
								style={{
									paddingVertical: 6,
									paddingHorizontal: 10,
									marginRight: 10,
									marginBottom: 8,
									backgroundColor: timeOfDay === time ? "#00509e" : "#cce5ff",
									borderRadius: 6,
								}}
								onPress={() => setTimeOfDay(time as any)}
							>
								<Text style={{ color: timeOfDay === time ? "white" : "#00509e", fontWeight: "600" }}>{time}</Text>
							</TouchableOpacity>
						))}
					</View>
					<Text style={{ fontSize: 18, color: "#00509e", fontWeight: "600", marginTop: 12, marginBottom: 6 }}>🔧 Type of work:</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
						{["Gardening", "Painting", "Cleaning", "Removals", "Repairs and Installations", "Copywriting", "Data Entry", "Furniture Assembly"].map((type) => (
							<TouchableOpacity
								key={type}
								style={{
									paddingVertical: 6,
									paddingHorizontal: 10,
									marginRight: 10,
									marginBottom: 8,
									backgroundColor: jobType === type ? "#00509e" : "#cce5ff",
									borderRadius: 6,
								}}
								onPress={() => setJobType(type as any)}
							>
								<Text style={{ color: jobType === type ? "white" : "#00509e", fontWeight: "600" }}>{type}</Text>
							</TouchableOpacity>
						))}
					</View>
					<View style={{ marginTop: 20 }}>
						<Button title="📤 Submit Task" onPress={handleSubmit} />
					</View>
					<View style={{ marginTop: 10 }}>
						<Button
							title="❌ Cancel"
							color="red"
							onPress={() => {
								setShowForm(false);
								setMessage(null);
								setMessageType(null);
							}}
						/>
					</View>
				</View>
			)}

			{message && (
				<View
					style={{
						marginTop: 20,
						padding: 12,
						borderRadius: 6,
						backgroundColor: messageType === "error" ? "#f8d7da" : "#d1e7dd",
						borderColor: messageType === "error" ? "#f5c2c7" : "#badbcc",
						borderWidth: 1,
					}}
				>
					<Text style={{ fontSize: 16, color: messageType === "error" ? "#842029" : "#0f5132" }}>{message}</Text>
				</View>
			)}

			{user.user_role === "customer" ? (
				<View style={{ marginTop: 24, backgroundColor: "#d6eaff", padding: 16, borderRadius: 8 }}>
					<Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Ласкаво просимо, клієнте!</Text>
					<Text>Ви можете шукати виконавців та створювати завдання.</Text>
				</View>
			) : user.user_role === "worker" ? (
				<View style={{ marginTop: 24, backgroundColor: "#d6eaff", padding: 16, borderRadius: 8 }}>
					<Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Вітаємо, працівнику!</Text>
					<Text>Перегляньте доступні завдання та подавайте заявки.</Text>
				</View>
			) : (
				<Text style={{ marginTop: 20, color: "red", fontSize: 16, textAlign: "center" }}>Невідома роль користувача</Text>
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
	formContainer: {
		marginTop: 20,
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 8,
		elevation: 2,
	},
	input: {
		backgroundColor: "#eef",
		borderColor: "#00509e",
		borderWidth: 1,
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginBottom: 12,
		fontSize: 16,
	},
	enumContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 12,
	},
	enumButton: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		marginRight: 10,
		marginBottom: 8,
		backgroundColor: "#cce5ff",
		borderRadius: 6,
	},
	enumButtonSelected: {
		backgroundColor: "#00509e",
	},
	enumButtonText: {
		color: "#00509e",
		fontWeight: "600",
	},
	enumButtonTextSelected: {
		color: "white",
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
});
