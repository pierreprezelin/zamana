import { useIsFocused } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { useTabBarOffset } from "@/components/TabBar";
import { TabScreen } from "@/components/TabScreen";
import { ResourcesPreview } from "@/features/articles/components/ResourcesPreview";
import { TodayTasks } from "@/features/care/components/TodayTasks";
import { todayTasks } from "@/features/care/todayTasks";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import {
	RemindersBanner,
	useShowRemindersBanner,
} from "@/features/notifications/components/RemindersBanner";
import { GardenPreview } from "@/features/plants/components/GardenPreview";
import { NewPlantCard } from "@/features/plants/components/NewPlantCard";
import { useNewPlantToFeature } from "@/features/plants/useNewPlantToFeature";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { TipCard } from "@/features/tips/components/TipCard";
import { useTodayTip } from "@/features/tips/useTodayTip";
import { greeting } from "@/features/user/greeting";
import { useUserStore } from "@/features/user/useUserStore";
import { WeatherAlertBanner } from "@/features/weather/components/WeatherAlertBanner";
import {
	useNeedsWeatherPlace,
	WeatherPlaceBanner,
} from "@/features/weather/components/WeatherPlaceBanner";
import { useWeatherAlert } from "@/features/weather/useWeatherAlert";
import { toISODate } from "@/utils/dates";
import { pluralForm, t } from "@/utils/i18n";

export default function TodayScreen() {
	const name = useUserStore((state) => state.name);
	const plants = usePlantStore((state) => state.plants);
	const cares = useCareStore((state) => state.cares);
	const logs = useCareStore((state) => state.logs);
	const climate = useCarePreferencesStore((state) => state.climate);
	const tabBarOffset = useTabBarOffset();
	const today = toISODate(new Date());
	const weatherAlert = useWeatherAlert();
	const needsPlace = useNeedsWeatherPlace();
	const showReminders = useShowRemindersBanner() && plants.length > 0;
	const tip = useTodayTip(today, climate);
	const newPlant = useNewPlantToFeature();
	// Re-renders on focus so the greeting and the tasks follow the time of day
	useIsFocused();

	const groups = useMemo(
		() => todayTasks({ plants, cares, logs, today, climate }),
		[plants, cares, logs, today, climate],
	);
	const pending = groups.reduce((sum, group) => sum + group.pendingCount, 0);
	const dueDone = groups.reduce((sum, group) => sum + group.dueDoneCount, 0);
	const subtitle = pending
		? t(`care.tasks.count.${pluralForm(pending)}`, { amount: pending })
		: t(dueDone ? "care.tasks.allDoneSubtitle" : "care.tasks.none");

	return (
		<TabScreen
			title={greeting(new Date().getHours(), name)}
			subtitle={subtitle}
			showSettings
			scrollBottomInset={tabBarOffset + 16}
		>
			{(weatherAlert || tip || needsPlace || showReminders || newPlant) && (
				<View className="gap-2">
					{weatherAlert && <WeatherAlertBanner alert={weatherAlert} />}
					{tip && <TipCard tip={tip} today={today} />}
					{needsPlace && <WeatherPlaceBanner />}
					{showReminders && <RemindersBanner />}
					{newPlant && <NewPlantCard plant={newPlant} />}
				</View>
			)}
			{plants.length > 0 && <TodayTasks groups={groups} today={today} />}
			<GardenPreview />
			<ResourcesPreview />
		</TabScreen>
	);
}
