import { useIsFocused } from "expo-router";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { GardenPreview } from "@/features/plants/components/GardenPreview";
import { greeting } from "@/features/user/greeting";
import { useUserStore } from "@/features/user/useUserStore";

export default function TodayScreen() {
	const name = useUserStore((state) => state.name);
	// Re-renders on focus so the greeting follows the time of day
	useIsFocused();

	return (
		<ScreenPlaceholder
			title={greeting(new Date().getHours(), name)}
			subtitle="Qu'allons-nous faire aujourd'hui ?"
			showSettings
		>
			<GardenPreview />
		</ScreenPlaceholder>
	);
}
