import "../global.css";
import { Stack } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import palette from "@/constants/palette";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

const navigationTheme = (scheme: "light" | "dark") => {
	const base = scheme === "dark" ? DarkTheme : DefaultTheme;
	return {
		...base,
		colors: {
			...base.colors,
			primary: palette.forest[scheme],
			background: palette.background[scheme],
			card: palette.surface[scheme],
			text: palette.moss[scheme],
			border: palette.line[scheme],
		},
	};
};

export default function RootLayout() {
	const scheme = useColorScheme() === "dark" ? "dark" : "light";
	const onboardingCompleted = useOnboardingStore((state) => state.completed);

	return (
		<ThemeProvider value={navigationTheme(scheme)}>
			<Stack>
				<Stack.Protected guard={!onboardingCompleted}>
					<Stack.Screen name="welcome" options={{ headerShown: false }} />
				</Stack.Protected>
				<Stack.Protected guard={onboardingCompleted}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				</Stack.Protected>
				<Stack.Screen name="settings/index" options={{ title: "Paramètres" }} />
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
				<Stack.Screen name="plant/[id]/edit" options={{ title: "Modifier" }} />
				<Stack.Screen
					name="plant/[id]/history-entry"
					options={{ title: "Entrée d'historique" }}
				/>
				<Stack.Screen
					name="encyclopedia/[id]"
					options={{ title: "Encyclopédie" }}
				/>
				<Stack.Screen name="tips/[id]" options={{ title: "Article" }} />
			</Stack>
		</ThemeProvider>
	);
}
