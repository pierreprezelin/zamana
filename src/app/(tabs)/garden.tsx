import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function GardenScreen() {
	return (
		<ScreenPlaceholder
			title="Jardin"
			links={[
				{ label: "Paramètres", href: "/settings" },
				{ label: "Plante #1", href: "/plant/1" },
				{ label: "Ajouter une plante", href: "/plant/new" },
			]}
		/>
	);
}
