import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function EncyclopediaScreen() {
	return (
		<ScreenPlaceholder
			title="Encyclopédie"
			links={[{ label: "Résultat #1", href: "/encyclopedia/1" }]}
		/>
	);
}
