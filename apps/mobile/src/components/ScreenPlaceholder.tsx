import { type Href, Link } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";

type ScreenPlaceholderProps = {
	title: string;
	subtitle?: string;
	links?: { label: string; href: Href }[];
	showSettings?: boolean;
	children?: ReactNode;
};

export function ScreenPlaceholder({
	title,
	subtitle,
	links = [],
	showSettings = false,
	children,
}: ScreenPlaceholderProps) {
	const { top } = useSafeAreaInsets();

	return (
		<View style={{ flex: 1, paddingTop: top }}>
			<View className="flex-1 gap-5 p-5">
				<View className="flex-row items-start justify-between gap-5">
					<View>
						<Text className="font-recoleta text-[28px] text-moss">{title}</Text>
						{subtitle && (
							<Text className="text-[16px] text-secondary">{subtitle}</Text>
						)}
					</View>
					{showSettings && (
						<Link href="/settings" asChild>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Paramètres"
								pressedOpacity={0.5}
								hitSlop={8}
								className="size-10 items-center justify-center rounded-full"
							>
								<Ionicons
									name="settings-outline"
									size={24}
									className="text-moss"
								/>
							</Pressable>
						</Link>
					)}
				</View>
				{links.map(({ label, href }) => (
					<Link key={label} href={href} asChild>
						<Text className="text-forest">→ {label}</Text>
					</Link>
				))}
				{children}
			</View>
		</View>
	);
}
