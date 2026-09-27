import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export default function WelcomeScreen() {
	return (
		<ScreenPlaceholder
			title="Welcome (étapes 1 à 4)"
			links={[{ label: "Commencer", href: "/" }]}
		/>
	);
}
