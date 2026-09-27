import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function GardenScreen() {
	return (
		<ScreenPlaceholder
			title="Jardin"
			showSettings
			links={[
				{ label: "Plante #1", href: "/plant/1" },
				{ label: "Ajouter une plante", href: "/plant/new" },
			]}
		/>
	);
}
