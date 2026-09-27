import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function TodayScreen() {
	return (
		<ScreenPlaceholder
			title="Aujourd'hui"
			links={[
				{ label: "Paramètres", href: "/settings" },
				{ label: "Plante #1", href: "/plant/1" },
				{ label: "Ajouter une plante", href: "/plant/new" },
				{ label: "Voir tout le jardin", href: "/garden" },
			]}
		/>
	);
}
