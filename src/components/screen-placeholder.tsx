import { type Href, Link } from "expo-router";
import { Text, View } from "react-native";

type ScreenPlaceholderProps = {
	title: string;
	links?: { label: string; href: Href }[];
};

export function ScreenPlaceholder({
	title,
	links = [],
}: ScreenPlaceholderProps) {
	return (
		<View style={{ flex: 1, padding: 16, gap: 16 }}>
			<Text>{title}</Text>
			{links.map(({ label, href }) => (
				<Link key={label} href={href}>
					→ {label}
				</Link>
			))}
		</View>
	);
}
