import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function EncyclopediaScreen() {
	return (
		<ScreenPlaceholder
			title="Encyclopédie"
			links={[{ label: "Résultat #1", href: "/encyclopedia/1" }]}
		/>
	);
}
