import AsyncStorage from "@react-native-async-storage/async-storage";

const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE";

export const getInitialNavigationState = async () => {
	try {
		const state = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
		return state ? JSON.parse(state) : undefined;
	} catch (e) {
		console.warn("Failed to load navigation state", e);
		return undefined;
	}
};

export const persistNavigationState = async (state: any) => {
	try {
		await AsyncStorage.setItem(NAVIGATION_PERSISTENCE_KEY, JSON.stringify(state));
	} catch (e) {
		console.warn("Failed to save navigation state", e);
	}
};
