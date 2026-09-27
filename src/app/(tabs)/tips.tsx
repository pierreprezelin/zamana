import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function TipsScreen() {
	return (
		<ScreenPlaceholder
			title="Conseils"
			links={[{ label: "Article #1", href: "/tips/1" }]}
		/>
	);
}
