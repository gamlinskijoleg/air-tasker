import React, { useEffect, useState } from "react";
import { NavigationContainer, InitialState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AccountScreen from "./screens/AccountScreen";
import BrowseScreen from "./screens/BrowseScreen";
import MessagesScreen from "./screens/MessagesScreen";
import MyTasksScreen from "./screens/MyTasksScreen";
import TaskDetailsScreen from "./screens/TaskDetailsScreen";

import { UserProvider } from "./context/UserContext";
import { getInitialNavigationState, persistNavigationState } from "./utils/navigationPersistence";

export type Task = {
	id: string;
	description: string;
	who_made_id: string;
	price: number;
	place: string;
	day: string;
	time: string;
	is_taken: boolean;
	who_took: string | null;
	is_open: boolean;
	type: string;
	title: string;
	status: "Open" | "Canceled" | "Assigned" | "Done" | "Completed" | "Applied";
	applicationsCount?: number;
	assignedUserId?: string;
	who_made_username: string;
};

export type UserType = {
	id: string;
	email: string;
	username: string;
	user_role: "customer" | "worker" | null;
};

export type RootStackParamList = {
	home: undefined;
	login: undefined;
	registration: undefined;
	mainTabs: undefined;
	taskDetails: { task: Task; appliedTasks: any[] };
};

export type MainTabsParamList = {
	dashboard: undefined;
	account: undefined;
	browse: undefined;
	messages: undefined;
	mytasks: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
	return (
		<Tab.Navigator
			initialRouteName="dashboard"
			screenOptions={{
				headerShown: true,
				tabBarActiveTintColor: "#00509e",
				tabBarInactiveTintColor: "#888",
				tabBarStyle: { backgroundColor: "#f0f8ff", paddingBottom: 4, height: 60 },
				tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
			}}
		>
			<Tab.Screen name="dashboard" component={DashboardScreen} options={{ tabBarLabel: "Дашборд" }} />
			<Tab.Screen name="browse" component={BrowseScreen} options={{ tabBarLabel: "Пошук" }} />
			<Tab.Screen name="mytasks" component={MyTasksScreen} options={{ tabBarLabel: "Задачі" }} />
			<Tab.Screen name="messages" component={MessagesScreen} options={{ tabBarLabel: "Повідомлення" }} />
			<Tab.Screen name="account" component={AccountScreen} options={{ tabBarLabel: "Акаунт" }} />
		</Tab.Navigator>
	);
}

export default function App() {
	const [isReady, setIsReady] = useState(false);
	const [initialState, setInitialState] = useState<InitialState | undefined>();

	useEffect(() => {
		const restoreState = async () => {
			const state = await getInitialNavigationState();
			if (state) setInitialState(state);
			setIsReady(true);
		};
		restoreState();
	}, []);

	if (!isReady) return null;

	return (
		<UserProvider>
			<NavigationContainer initialState={initialState} onStateChange={(state) => persistNavigationState(state)}>
				<Stack.Navigator initialRouteName="home" screenOptions={{ headerTitleAlign: "center" }}>
					<Stack.Screen name="home" component={HomeScreen} options={{ title: "Головна" }} />
					<Stack.Screen name="login" component={LoginScreen} options={{ title: "Вхід" }} />
					<Stack.Screen name="registration" component={RegisterScreen} options={{ title: "Реєстрація" }} />
					<Stack.Screen name="mainTabs" component={MainTabs} options={{ headerShown: false }} />
					<Stack.Screen name="taskDetails" component={TaskDetailsScreen} options={{ title: "Деталі завдання" }} />
				</Stack.Navigator>
			</NavigationContainer>
		</UserProvider>
	);
}
