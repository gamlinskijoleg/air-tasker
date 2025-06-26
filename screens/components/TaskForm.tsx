import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface TaskFormProps {
	title: string;
	setTitle: (value: string) => void;
	description: string;
	setDescription: (value: string) => void;
	price: string;
	setPrice: (value: string) => void;
	place: string;
	setPlace: (value: string) => void;
	day: string;
	setDay: (value: string) => void;
	timeOfDay: string;
	setTimeOfDay: (value: string) => void;
	jobType: string;
	setJobType: (value: string) => void;
	onSubmit: () => void;
	onCancel: () => void;
}

const jobTypes = ["Gardening", "Painting", "Cleaning", "Removals", "Repairs and Installations", "Copywriting", "Data Entry", "Furniture Assembly"];

export const TaskForm = ({
	title,
	description,
	setDescription,
	setTitle,
	price,
	setPrice,
	place,
	setPlace,
	day,
	setDay,
	timeOfDay,
	setTimeOfDay,
	jobType,
	setJobType,
	onSubmit,
	onCancel,
}: TaskFormProps) => {
	return (
		<View style={styles.formContainer}>
			<Text style={styles.header}>Створити нове завдання</Text>

			<Text style={styles.label}>Заголовок завдання</Text>
			<TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Введіть заголовок" />

			<Text style={styles.label}>Опис</Text>
			<TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Опишіть завдання" multiline numberOfLines={4} />

			<Text style={styles.label}>Місце</Text>
			<TextInput style={styles.input} value={place} onChangeText={setPlace} placeholder="Введіть місце" />

			<Text style={styles.label}>Ціна</Text>
			<TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Введіть ціну" />

			<Text style={styles.label}>День</Text>
			<TextInput style={styles.input} value={day} onChangeText={setDay} placeholder="Введіть день" />

			<Text style={styles.label}>Час доби</Text>
			<View style={styles.pickerWrapper}>
				<Picker
					selectedValue={timeOfDay}
					onValueChange={setTimeOfDay}
					mode="dropdown" // Для iOS: "dropdown" краще виглядає
					style={styles.picker}
				>
					<Picker.Item label="Morning" value="Morning" />
					<Picker.Item label="Afternoon" value="Afternoon" />
					<Picker.Item label="Evening" value="Evening" />
					<Picker.Item label="Night" value="Night" />
				</Picker>
			</View>

			<Text style={styles.label}>Тип роботи</Text>
			<View style={styles.pickerWrapper}>
				<Picker selectedValue={jobType} onValueChange={setJobType} mode="dropdown" style={styles.picker}>
					{jobTypes.map((job) => (
						<Picker.Item key={job} label={job} value={job} />
					))}
				</Picker>
			</View>

			<View style={styles.buttonRow}>
				<Button title="Скасувати" onPress={onCancel} color="#999" />
				<Button title="Відправити" onPress={onSubmit} color="#0066cc" />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	formContainer: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 8,
		marginVertical: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 4,
	},
	header: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 16,
		color: "#00509e",
		textAlign: "center",
	},
	label: {
		fontWeight: "600",
		marginBottom: 6,
		color: "#333",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		paddingHorizontal: 12,
		paddingVertical: Platform.OS === "ios" ? 14 : 8,
		borderRadius: 6,
		marginBottom: 16,
		fontSize: 16,
	},
	pickerWrapper: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 6,
		marginBottom: 16,
		overflow: "hidden",
	},
	picker: {
		height: 44,
		width: "100%",
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	textArea: {
		minHeight: 80,
		textAlignVertical: "top",
	},
});
