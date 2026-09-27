import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function SettingsScreen() {
	return (
		<ScreenPlaceholder
			title="Paramètres"
			links={[{ label: "Notifications", href: "/settings/notifications" }]}
		/>
	);
}
