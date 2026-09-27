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
		<View className="flex-1 gap-4 p-4">
			<Text className="font-recoleta text-2xl text-moss">{title}</Text>
			{links.map(({ label, href }) => (
				<Link key={label} href={href} asChild>
					<Text className="font-outfit text-forest">→ {label}</Text>
				</Link>
			))}
		</View>
	);
}
