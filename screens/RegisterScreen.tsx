import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, UserType } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "registration">;

interface RegisterResponse {
	user: UserType;
	session: {
		access_token: string;
	};
}

export default function RegisterScreen({ navigation }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);

	const onRegister = async () => {
		if (!email || !password || !username) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			const res = await axios.post<RegisterResponse>("http://localhost:3000/register", {
				email,
				password,
				username,
			});

			const { user, session } = res.data;

			if (!session) {
				Alert.alert("Confirmation", "Please confirm your email to log in.");
				setLoading(false);
				return;
			}

			Alert.alert("Success", "Registration was successful");
			setEmail("");
			setPassword("");
			setUsername("");
			navigation.replace("mainTabs");
		} catch (error: any) {
			console.error(error);
			Alert.alert("Registration Error", error.response?.data?.error || error.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.container}>
			<Text style={styles.title}>Registration</Text>

			<TextInput style={styles.input} placeholder="Username" placeholderTextColor="#6699cc" autoCapitalize="none" value={username} onChangeText={setUsername} />

			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#6699cc"
				keyboardType="email-address"
				autoCapitalize="none"
				autoComplete="email"
				textContentType="emailAddress"
				value={email}
				onChangeText={setEmail}
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#6699cc"
				secureTextEntry
				autoComplete="password"
				textContentType="password"
				value={password}
				onChangeText={setPassword}
			/>

			<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onRegister} disabled={loading}>
				<Text style={styles.buttonText}>{loading ? "Wait..." : "Register"}</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f8ff",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 32,
		color: "#00509e",
		fontWeight: "bold",
		marginBottom: 24,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#fff",
		borderColor: "#00509e",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: "#00509e",
		marginBottom: 16,
	},
	button: {
		backgroundColor: "#00509e",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonDisabled: {
		backgroundColor: "#6699cc",
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});
