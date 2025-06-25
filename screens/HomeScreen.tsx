import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "home">;

export default function HomeScreen({ navigation }: Props) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome!</Text>
			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate("registration")}>
				<Text style={styles.buttonText}>Register</Text>
			</TouchableOpacity>
			<TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate("login")}>
				<Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 30,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#1E40AF",
		marginBottom: 40,
	},
	button: {
		width: "100%",
		backgroundColor: "#3B82F6",
		paddingVertical: 15,
		borderRadius: 8,
		marginVertical: 10,
		alignItems: "center",
		shadowColor: "#3B82F6",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 18,
		fontWeight: "600",
	},
	loginButton: {
		backgroundColor: "#EFF6FF",
		borderWidth: 1,
		borderColor: "#3B82F6",
	},
	loginButtonText: {
		color: "#1E40AF",
	},
});
