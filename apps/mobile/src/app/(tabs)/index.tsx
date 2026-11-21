import { useIsFocused } from "expo-router";
import { useMemo } from "react";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { useTabBarOffset } from "@/components/TabBar";
import { TodayTasks } from "@/features/care/components/TodayTasks";
import { todayTasks } from "@/features/care/todayTasks";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import { RemindersBanner } from "@/features/notifications/components/RemindersBanner";
import { GardenPreview } from "@/features/plants/components/GardenPreview";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { greeting } from "@/features/user/greeting";
import { useUserStore } from "@/features/user/useUserStore";
import { WeatherAlertBanner } from "@/features/weather/components/WeatherAlertBanner";
import { WeatherPlaceBanner } from "@/features/weather/components/WeatherPlaceBanner";
import { toISODate } from "@/utils/dates";
import { pluralForm, t } from "@/utils/i18n";

export default function TodayScreen() {
	const name = useUserStore((state) => state.name);
	const plants = usePlantStore((state) => state.plants);
	const cares = useCareStore((state) => state.cares);
	const logs = useCareStore((state) => state.logs);
	const climate = useCarePreferencesStore((state) => state.climate);
	const tabBarOffset = useTabBarOffset();
	// Re-renders on focus so the greeting and the tasks follow the time of day
	useIsFocused();

	const today = toISODate(new Date());
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
		<ScreenPlaceholder
			title={greeting(new Date().getHours(), name)}
			subtitle={subtitle}
			showSettings
			scrollBottomInset={tabBarOffset + 16}
		>
			<WeatherPlaceBanner />
			<WeatherAlertBanner />
			{plants.length > 0 && <RemindersBanner />}
			{plants.length > 0 && <TodayTasks groups={groups} today={today} />}
			<GardenPreview />
		</ScreenPlaceholder>
	);
}
