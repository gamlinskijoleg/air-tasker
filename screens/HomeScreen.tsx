import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../App";
import { useUserContext } from "../context/UserContext";

type Props = NativeStackScreenProps<RootStackParamList, "home">;

export default function HomeScreen({ navigation }: Props) {
	const [checkingAuth, setCheckingAuth] = React.useState(true);
	const { setToken } = useUserContext();
	useEffect(() => {
		const checkToken = async () => {
			try {
				const token = await AsyncStorage.getItem("token");
				if (token) {
					setToken(token);
					navigation.reset({
						index: 0,
						routes: [{ name: "mainTabs", params: { screen: "dashboard" } }],
					});
				}
			} catch (e) {
				console.error("Error reading token", e);
			} finally {
				setCheckingAuth(false);
			}
		};
		checkToken();
	}, [navigation]);

	if (checkingAuth) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#3B82F6" />
			</View>
		);
	}

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
	center: {
		justifyContent: "center",
		alignItems: "center",
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
