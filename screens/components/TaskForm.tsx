import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

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

interface TaskFormProps {
	formState: FormState;
	setFormState: React.Dispatch<React.SetStateAction<FormState>>;
	onSubmit: () => void;
	onCancel: () => void;
}

const jobTypes = ["Gardening", "Painting", "Cleaning", "Removals", "Repairs and Installations", "Copywriting", "Data Entry", "Furniture Assembly"];

export const TaskForm = ({ formState, setFormState, onSubmit, onCancel }: TaskFormProps) => {
	return (
		<View style={styles.formContainer}>
			<Text style={styles.header}>Create a New Task</Text>

			<Text style={styles.label}>Task Title</Text>
			<TextInput
				style={styles.input}
				value={formState.title}
				onChangeText={(text) => setFormState((prev) => ({ ...prev, title: text }))}
				placeholder="Enter title"
				placeholderTextColor="#999"
			/>

			<Text style={styles.label}>Description</Text>
			<TextInput
				style={[styles.input, styles.textArea]}
				value={formState.description}
				onChangeText={(text) => setFormState((prev) => ({ ...prev, description: text }))}
				placeholder="Describe the task"
				multiline
				numberOfLines={4}
				placeholderTextColor="#999"
			/>

			<Text style={styles.label}>Location</Text>
			<TextInput
				style={styles.input}
				value={formState.place}
				onChangeText={(text) => setFormState((prev) => ({ ...prev, place: text }))}
				placeholder="Enter location"
				placeholderTextColor="#999"
			/>

			<Text style={styles.label}>Price</Text>
			<TextInput
				style={styles.input}
				value={formState.price}
				onChangeText={(text) => setFormState((prev) => ({ ...prev, price: text }))}
				keyboardType="numeric"
				placeholder="Enter price"
				placeholderTextColor="#999"
			/>

			<Text style={styles.label}>Day</Text>
			<TextInput
				style={styles.input}
				value={formState.day}
				onChangeText={(text) => setFormState((prev) => ({ ...prev, day: text }))}
				placeholder="Enter day"
				placeholderTextColor="#999"
			/>

			<Text style={styles.label}>Time of Day</Text>
			<View style={styles.pickerWrapper}>
				<Picker
					selectedValue={formState.timeOfDay}
					onValueChange={(value) => setFormState((prev) => ({ ...prev, timeOfDay: value }))}
					mode="dropdown"
					style={styles.picker}
					dropdownIconColor="#00509e"
				>
					<Picker.Item label="Morning" value="Morning" />
					<Picker.Item label="Afternoon" value="Afternoon" />
					<Picker.Item label="Evening" value="Evening" />
					<Picker.Item label="Night" value="Night" />
				</Picker>
			</View>

			<Text style={styles.label}>Job Type</Text>
			<View style={styles.pickerWrapper}>
				<Picker
					selectedValue={formState.jobType}
					onValueChange={(value) => setFormState((prev) => ({ ...prev, jobType: value }))}
					mode="dropdown"
					style={styles.picker}
					dropdownIconColor="#00509e"
				>
					{jobTypes.map((job) => (
						<Picker.Item key={job} label={job} value={job} />
					))}
				</Picker>
			</View>

			<View style={styles.buttonRow}>
				<TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
					<Text style={styles.cancelButtonText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.submitButton]} onPress={onSubmit}>
					<Text style={styles.submitButtonText}>Submit</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	formContainer: {
		backgroundColor: "#fff",
		padding: 24,
		borderRadius: 16,
		marginVertical: 20,
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 15,
		shadowOffset: { width: 0, height: 7 },
		elevation: 6,
	},
	header: {
		fontSize: 26,
		fontWeight: "900",
		marginBottom: 20,
		color: "#00509e",
		textAlign: "center",
		letterSpacing: 1,
	},
	label: {
		fontWeight: "700",
		marginBottom: 8,
		color: "#2a2a2a",
		fontSize: 17,
	},
	input: {
		borderWidth: 1,
		borderColor: "#b0b0b0",
		paddingHorizontal: 16,
		paddingVertical: Platform.OS === "ios" ? 16 : 10,
		borderRadius: 10,
		marginBottom: 18,
		fontSize: 17,
		color: "#222",
		backgroundColor: "#fafafa",
	},
	textArea: {
		minHeight: 100,
		textAlignVertical: "top",
	},
	pickerWrapper: {
		borderWidth: 1,
		borderColor: "#b0b0b0",
		borderRadius: 10,
		marginBottom: 18,
		overflow: "hidden",
		backgroundColor: "#fafafa",
	},
	picker: {
		height: 48,
		width: "100%",
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	button: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 6,
		shadowColor: "#004080",
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 5 },
		shadowRadius: 8,
		elevation: 4,
	},
	cancelButton: {
		backgroundColor: "#e1e1e1",
	},
	submitButton: {
		backgroundColor: "#00509e",
	},
	cancelButtonText: {
		color: "#555",
		fontWeight: "700",
		fontSize: 16,
	},
	submitButtonText: {
		color: "#fff",
		fontWeight: "800",
		fontSize: 16,
	},
});
