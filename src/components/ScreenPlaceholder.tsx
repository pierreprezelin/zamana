import { type Href, Link } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@/components/ionicons";
import PressFeedback from "@/components/Pressable";
import Text from "@/components/Text";

type ScreenPlaceholderProps = {
	title: string;
	links?: { label: string; href: Href }[];
	showSettings?: boolean;
};

export function ScreenPlaceholder({
	title,
	links = [],
	showSettings = false,
}: ScreenPlaceholderProps) {
	return (
		<SafeAreaView edges={["top"]} style={{ flex: 1 }}>
			<View className="flex-1 gap-5 p-5">
				<View className="flex-row items-center justify-between gap-5">
					<Text className="font-recoleta text-2xl text-moss">{title}</Text>
					{showSettings && (
						<Link href="/settings" asChild>
							<PressFeedback
								accessibilityRole="button"
								accessibilityLabel="Paramètres"
								pressedOpacity={0.5}
								className="size-10 items-center justify-center rounded-full"
							>
								<Ionicons
									name="settings-outline"
									size={24}
									className="text-moss"
								/>
							</PressFeedback>
						</Link>
					)}
				</View>
				{links.map(({ label, href }) => (
					<Link key={label} href={href} asChild>
						<Text className="text-forest">→ {label}</Text>
					</Link>
				))}
			</View>
		</SafeAreaView>
	);
}
