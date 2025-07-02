import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import axios from "axios";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, UserType } from "../App";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUserContext } from "../context/UserContext";

type Props = NativeStackScreenProps<RootStackParamList, "registration">;

interface RegisterResponse {
	user: UserType;
	session: {
		access_token: string;
	} | null;
}

interface LoginResponse {
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
	const [needConfirm, setNeedConfirm] = useState(false);

	const { setUser, setToken, setRole } = useUserContext();

	const onRegister = async () => {
		if (!email || !password || !username) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			const res = await axios.post<RegisterResponse>("http://10.0.2.2:3000/register", {
				email,
				password,
				username,
			});

			const { user, session } = res.data;

			if (!session) {
				setNeedConfirm(true);
				console.log("session isnot here!");
				setLoading(false);
				return;
			} else {
				console.log("session is here!");
			}
			const token = session.access_token;

			setUser(user);
			setToken(token);
			setRole(user.user_role);

			Alert.alert("Success", "Registration successful");
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

	const onConfirmedEmail = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Email and password are required to log in");
			return;
		}

		setLoading(true);
		try {
			const res = await axios.post<LoginResponse>("http://10.0.2.2:3000/login", { email, password });
			const { user, session } = res.data;

			if (!session) {
				Alert.alert("Error", "Email not confirmed yet, please check your email.");
				setLoading(false);
				return;
			}

			const token = session.access_token;

			setUser(user);
			setToken(token);
			setRole(user.user_role);

			Alert.alert("Success", "You are now logged in");
			setNeedConfirm(false);
			setEmail("");
			setPassword("");
			setUsername("");

			navigation.replace("mainTabs");
		} catch (error: any) {
			console.error(error);
			Alert.alert("Login Error", error.response?.data?.error || error.message || "Unable to login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.container}>
			<TouchableOpacity style={styles.iconBack} onPress={() => navigation.navigate("home")}>
				<Ionicons name="arrow-back" size={28} color="#00509e" />
			</TouchableOpacity>

			<Text style={styles.title}>Registration</Text>

			<TextInput
				style={styles.input}
				placeholder="Username"
				placeholderTextColor="#6699cc"
				autoCapitalize="none"
				value={username}
				onChangeText={setUsername}
				editable={!needConfirm}
			/>

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
				editable={!needConfirm}
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
				editable={!needConfirm}
			/>

			{!needConfirm ? (
				<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onRegister} disabled={loading}>
					<Text style={styles.buttonText}>{loading ? "Wait..." : "Register"}</Text>
				</TouchableOpacity>
			) : (
				<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: "#28a745" }]} onPress={onConfirmedEmail} disabled={loading}>
					<Text style={styles.buttonText}>{loading ? "Checking..." : "I confirmed my email"}</Text>
				</TouchableOpacity>
			)}
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
