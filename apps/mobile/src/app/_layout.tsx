import "../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ObserveRoot, useObserve } from "expo-observe";
import { Stack } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { toastConfig } from "@/components/toastConfig";
import { ForceUpdateSheet } from "@/features/appVersion/components/ForceUpdateSheet";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
// Loaded eagerly so the saved theme is applied before the first render
import "@/features/theme/useThemeStore";
import { useCSSVariable } from "uniwind";

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

const useNavigationTheme = () => {
	const base = useColorScheme() === "dark" ? DarkTheme : DefaultTheme;
	const [primary, background, card, text, border] = useCSSVariable([
		"--color-forest",
		"--color-background",
		"--color-surface",
		"--color-moss",
		"--color-line",
	]) as string[];
	return {
		...base,
		colors: { ...base.colors, primary, background, card, text, border },
	};
};

function RootLayout() {
	const navigationTheme = useNavigationTheme();
	const onboardingCompleted = useOnboardingStore((state) => state.completed);
	const { markInteractive } = useObserve();
	const { top } = useSafeAreaInsets();

	useEffect(() => {
		markInteractive();
	}, [markInteractive]);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={navigationTheme}>
				<BottomSheetModalProvider>
					<StatusBar style="auto" />
					<Stack
						screenOptions={{
							headerTitleStyle: {
								fontFamily: "Recoleta-SemiBold",
								fontSize: 20,
							},
							headerTitleAlign: "left",
							headerStyle: {
								backgroundColor: navigationTheme.colors.background,
							},
							headerShadowVisible: false,
							headerTintColor: navigationTheme.colors.text,
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

export default ObserveRoot.wrap(RootLayout);
