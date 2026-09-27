import { type Href, Link } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/Text";

type ScreenPlaceholderProps = {
	title: string;
	links?: { label: string; href: Href }[];
};

export function ScreenPlaceholder({
	title,
	links = [],
}: ScreenPlaceholderProps) {
	return (
		<SafeAreaView edges={["top"]} style={{ flex: 1 }}>
			<View className="flex-1 gap-4 p-4">
				<Text className="font-recoleta text-2xl text-moss">{title}</Text>
				{links.map(({ label, href }) => (
					<Link key={label} href={href} asChild>
						<Text className="text-forest">→ {label}</Text>
					</Link>
				))}
			</View>
		</SafeAreaView>
	);
}
