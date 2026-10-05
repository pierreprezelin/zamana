import "../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { toastConfig } from "@/components/toastConfig";
import palette from "@/constants/palette";
import { ForceUpdateSheet } from "@/features/appVersion/components/ForceUpdateSheet";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
// Loaded eagerly so the saved theme is applied before the first render
import "@/features/theme/useThemeStore";

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
	const { top } = useSafeAreaInsets();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={navigationTheme(scheme)}>
				<BottomSheetModalProvider>
					<StatusBar style="auto" />
					<Stack
						screenOptions={{
							headerTitleStyle: {
								fontFamily: "Recoleta-SemiBold",
								fontSize: 20,
							},
							headerTitleAlign: "left",
							headerStyle: { backgroundColor: palette.background[scheme] },
							headerShadowVisible: false,
							headerTintColor: palette.moss[scheme],
							headerBackButtonDisplayMode: "minimal",
							headerLeft:
								Platform.OS === "android" ? HeaderBackButton : undefined,
						}}
					>
						<Stack.Protected guard={!onboardingCompleted}>
							<Stack.Screen name="welcome" options={{ headerShown: false }} />
						</Stack.Protected>
						<Stack.Protected guard={onboardingCompleted}>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						</Stack.Protected>
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
						<Stack.Screen name="tips/[id]" options={{ title: "Article" }} />
					</Stack>
					<ForceUpdateSheet />
				</BottomSheetModalProvider>
			</ThemeProvider>
			<Toast config={toastConfig} topOffset={top + 8} />
		</GestureHandlerRootView>
	);
}
