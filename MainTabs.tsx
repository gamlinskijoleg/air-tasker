import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainTabsParamList, RootStackParamList } from "./App";
import DashboardScreen from "./screens/DashboardScreen";
import BrowseScreen from "./screens/BrowseScreen";
import MyTasksScreen from "./screens/MyTasksScreen";
import MessagesScreen from "./screens/MessagesScreen";
import AccountScreen from "./screens/AccountScreen";

type Props = NativeStackScreenProps<RootStackParamList, "mainTabs">;
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs({ route }: Props) {
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
