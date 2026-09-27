import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.setOptions({
	duration: 1000,
	fade: true
});

export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="(tabs)"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="welcome"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="settings/index"
				options={{ title: "Paramètres" }}
			/>
			<Stack.Screen
				name="settings/notifications"
				options={{ title: "Notifications" }}
			/>
			<Stack.Screen
				name="plant/new"
				options={{ title: "Ajouter une plante" }}
			/>
			<Stack.Screen
				name="plant/[id]/(sections)"
				options={{ title: "Plante" }}
			/>
			<Stack.Screen
				name="plant/[id]/edit"
				options={{ title: "Modifier" }}
			/>
			<Stack.Screen
				name="plant/[id]/history-entry"
				options={{ title: "Entrée d'historique" }}
			/>
			<Stack.Screen
				name="encyclopedia/[id]"
				options={{ title: "Encyclopédie" }}
			/>
			<Stack.Screen
				name="tips/[id]"
				options={{ title: "Article" }}
			/>
		</Stack>
	);
}
