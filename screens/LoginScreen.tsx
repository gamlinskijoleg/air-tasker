import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, UserType } from "../App";
import { useUserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = NativeStackScreenProps<RootStackParamList, "login">;

type LoginResponse = {
	user: UserType;
	session: {
		access_token: string;
	};
};

export default function LoginScreen({ navigation }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { setUser, setToken } = useUserContext();

	const onLogin = async () => {
		if (!email || !password) {
			Alert.alert("Помилка", "Будь ласка, заповніть всі поля");
			return;
		}

		setLoading(true);

		try {
			const res = await axios.post<LoginResponse>("http://10.0.2.2:3000/login", { email, password });

			const user = res.data.user;
			const token = res.data.session.access_token;

			setUser(user);
			setToken(token);
			await AsyncStorage.setItem("token", token);
			await AsyncStorage.setItem("user", JSON.stringify(user));

			setEmail("");
			setPassword("");

			navigation.replace("mainTabs");
		} catch (error: any) {
			console.error(error);
			Alert.alert("Login Error", error.response?.data?.error || error.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
			<TouchableOpacity style={styles.iconBack} onPress={() => navigation.navigate("home")}>
				<Ionicons name="arrow-back" size={28} color="#00509e" />
			</TouchableOpacity>

			<Text style={styles.title}>Log in</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
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

			<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onLogin} disabled={loading}>
				<Text style={styles.buttonText}>{loading ? "Wait..." : "Log in"}</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	iconBack: {
		position: "absolute",
		top: Platform.OS === "ios" ? 60 : 30,
		left: 20,
		zIndex: 10,
	},

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
