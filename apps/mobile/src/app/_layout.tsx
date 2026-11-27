import "../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
	clearLastNotificationResponse,
	DEFAULT_ACTION_IDENTIFIER,
	useLastNotificationResponse,
} from "expo-notifications";
import { Observe, ObserveRoot, useObserve } from "expo-observe";
import { type ErrorBoundaryProps, router, Stack } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { MessageScreen } from "@/components/MessageScreen";
import { toastConfig } from "@/components/toastConfig";
import { ForceUpdateSheet } from "@/features/appVersion/components/ForceUpdateSheet";
import { reloadIfLanguageChanged } from "@/features/language/useLanguageStore";
import { startReminderScheduler } from "@/features/notifications/scheduleReminders";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import {
	defineWeatherTask,
	startWeatherTaskSync,
} from "@/features/weather/weatherTask";
// Loaded eagerly so the saved theme is applied before the first render
import "@/features/theme/useThemeStore";
import { useCSSVariable } from "uniwind";
import { t } from "@/utils/i18n";

defineWeatherTask();
startReminderScheduler();
startWeatherTaskSync();
// Android keeps the app running when the phone language changes
AppState.addEventListener("change", (state) => {
	if (state === "active") reloadIfLanguageChanged();
});

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

const useNavigationTheme = () => {
	const base = useColorScheme() === "dark" ? DarkTheme : DefaultTheme;
	const [primary, background, card, text, border] = useCSSVariable([
		"--color-primary",
		"--color-background",
		"--color-surface",
		"--color-foreground",
		"--color-line",
	]) as [string, string, string, string, string];
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

	// The daily digest leads to the tasks of the day
	const notificationResponse = useLastNotificationResponse();
	useEffect(() => {
		if (notificationResponse?.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER)
			return;
		clearLastNotificationResponse();
		router.navigate("/");
	}, [notificationResponse]);

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
							options={{ title: t("screens.settings") }}
						/>
						<Stack.Screen
							name="settings/notifications"
							options={{ title: t("screens.notifications") }}
						/>
						<Stack.Screen
							name="settings/location"
							options={{ title: t("screens.location") }}
						/>
						<Stack.Screen
							name="settings/home"
							options={{ title: t("screens.home") }}
						/>
						<Stack.Screen
							name="settings/ergonomics"
							options={{ title: t("screens.ergonomics") }}
						/>
						<Stack.Screen
							name="settings/plantnet"
							options={{ title: t("screens.plantnet") }}
						/>
						<Stack.Screen
							name="settings/about"
							options={{ title: t("screens.about") }}
						/>
						<Stack.Screen
							name="plant/new"
							options={{ title: t("screens.newPlant") }}
						/>
						<Stack.Screen
							name="plant/[id]/(sections)"
							options={{ title: "" }}
						/>
						<Stack.Screen
							name="plant/[id]/edit"
							options={{ title: t("screens.editPlant") }}
						/>
						<Stack.Screen
							name="plant/[id]/history-entry"
							options={{ title: t("screens.historyEntry") }}
						/>
						<Stack.Screen name="encyclopedia/[id]" options={{ title: "" }} />
						<Stack.Screen name="tips/[id]" options={{ title: "" }} />
						<Stack.Screen name="tips/category/[id]" />
						<Stack.Screen name="+not-found" options={{ title: "" }} />
					</Stack>
					<ForceUpdateSheet />
				</BottomSheetModalProvider>
			</ThemeProvider>
			<Toast config={toastConfig} topOffset={top + 8} />
		</GestureHandlerRootView>
	);
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
	useEffect(() => Observe.reportError(error), [error]);

	return (
		<MessageScreen
			title={t("common.unexpectedError")}
			text={t("common.unexpectedErrorText")}
			action={{
				title: t("common.retry"),
				icon: "refresh-outline",
				onPress: retry,
			}}
		/>
	);
}

export default ObserveRoot.wrap(RootLayout);
