import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function MessagesScreen() {
	const [username, setUsername] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, refetch } = useCurrentUser("");

	useEffect(() => {
		const fetchUsername = async () => {
			try {
				const res: any = await axios.get("http://localhost:3000/user/username", {
					params: { email: user?.email },
				});
				setUsername(res.data.username || null);
			} catch (err: any) {
				setError("Failed to fetch username");
			} finally {
				setLoading(false);
			}
		};

		if (user?.email) fetchUsername();
	}, [user?.email]);

	useFocusEffect(
		useCallback(() => {
			refetch();
		}, [refetch])
	);

	if (loading) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" color="#000" />
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}

	if (!user) {
		return (
			<View style={styles.loaderContainer}>
				<Text style={styles.errorText}>User not found</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.loaderContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Your Profile</Text>

			<View style={styles.infoBlock}>
				<Text style={styles.label}>Username:</Text>
				<Text style={styles.value}>{username ?? "—"}</Text>
			</View>

			<View style={styles.infoBlock}>
				<Text style={styles.label}>Email:</Text>
				<Text style={styles.value}>{user.email ?? "—"}</Text>
			</View>

			<View style={styles.infoBlock}>
				<Text style={styles.label}>Role:</Text>
				<Text style={styles.value}>{user.user_role === "worker" ? "Worker" : user.user_role === "customer" ? " Customer" : "—"}</Text>
			</View>

			<View style={styles.infoBlock}>
				<Text style={styles.label}>User ID:</Text>
				<Text style={styles.value}>{user.id ?? "—"}</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 24,
		backgroundColor: "#fff",
		alignItems: "flex-start",
	},

	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#000",
		marginBottom: 24,
		alignSelf: "center",
	},

	infoBlock: {
		marginBottom: 20,
		width: "100%",
	},

	label: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
		textTransform: "uppercase",
		letterSpacing: 1,
	},

	value: {
		fontSize: 18,
		color: "#000",
		fontWeight: "500",
	},

	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},

	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#444",
	},

	errorText: {
		color: "#d00",
		fontSize: 18,
		textAlign: "center",
		paddingHorizontal: 20,
	},
});
