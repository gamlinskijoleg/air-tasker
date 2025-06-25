import React from "react";
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native";
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

export type UserType = {
	id: string;
	email: string;
	user_role: "customer" | "worker";
};

export type RootStackParamList = {
	home: undefined;
	login: undefined;
	registration: undefined;
	mainTabs: {
		user: UserType;
		token: string;
	};
};

export type MainTabsParamList = {
	dashboard: { user: UserType; token: string };
	account: { user: UserType; token: string };
	browse: { user: UserType; token: string };
	messages: { user: UserType; token: string };
	mytasks: { user: UserType; token: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Прокидаємо user та token як пропси в MainTabs і передаємо далі в кожен Tab.Screen
function MainTabs({ route }: { route: { params: { user: UserType; token: string } } }) {
	const { user, token } = route.params;

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
			<Tab.Screen name="dashboard" component={DashboardScreen} initialParams={{ user, token }} options={{ tabBarLabel: "Дашборд" }} />
			<Tab.Screen name="browse" component={BrowseScreen} initialParams={{ user, token }} options={{ tabBarLabel: "Пошук" }} />
			<Tab.Screen name="mytasks" component={MyTasksScreen} initialParams={{ user, token }} options={{ tabBarLabel: "Задачі" }} />
			<Tab.Screen name="messages" component={MessagesScreen} initialParams={{ user, token }} options={{ tabBarLabel: "Повідомлення" }} />
			<Tab.Screen name="account" component={AccountScreen} initialParams={{ user, token }} options={{ tabBarLabel: "Акаунт" }} />
		</Tab.Navigator>
	);
}

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="home" screenOptions={{ headerTitleAlign: "center" }}>
				<Stack.Screen name="home" component={HomeScreen} options={{ title: "Головна" }} />
				<Stack.Screen name="login" component={LoginScreen} options={{ title: "Вхід" }} />
				<Stack.Screen name="registration" component={RegisterScreen} options={{ title: "Реєстрація" }} />
				{/* Прокидаємо user та token у MainTabs через render prop */}
				<Stack.Screen name="mainTabs" options={{ headerShown: false }} component={MainTabs} initialParams={{ user: null as any, token: "" }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
