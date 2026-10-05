import { useIsFocused } from "expo-router";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { greeting } from "@/features/user/greeting";
import { useUserStore } from "@/features/user/useUserStore";

export default function TodayScreen() {
	const name = useUserStore((state) => state.name);
	// Re-renders on focus so the greeting follows the time of day
	useIsFocused();

	return (
		<ScreenPlaceholder
			title={greeting(new Date().getHours(), name)}
			showSettings
			links={[
				{ label: "Plante #1", href: "/plant/1" },
				{ label: "Ajouter une plante", href: "/plant/new" },
				{ label: "Voir tout le jardin", href: "/garden" },
			]}
		/>
	);
}
