import { type Href, Link } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

type ScreenPlaceholderProps = {
	title: string;
	subtitle?: string;
	links?: { label: string; href: Href }[];
	showSettings?: boolean;
	// Scrolls the content, clearing this bottom space (the floating tab bar)
	scrollBottomInset?: number;
	children?: ReactNode;
};

export function ScreenPlaceholder({
	title,
	subtitle,
	links = [],
	showSettings = false,
	scrollBottomInset,
	children,
}: ScreenPlaceholderProps) {
	const { top } = useSafeAreaInsets();
	const content = (
		<>
			<View className="flex-row items-start justify-between gap-4">
				<View>
					<Text className="font-recoleta text-[28px] text-foreground">
						{title}
					</Text>
					{subtitle && <Text className="text-base text-muted">{subtitle}</Text>}
				</View>
				{showSettings && (
					<Link href="/settings" asChild>
						<HeaderIconButton
							className="-mr-2"
							icon="settings-outline"
							accessibilityLabel={t("common.settings")}
						/>
					</Link>
				)}
			</View>
			{links.map(({ label, href }) => (
				<Link key={label} href={href} asChild>
					<Text className="text-primary">→ {label}</Text>
				</Link>
			))}
			{children}
		</>
	);

	return (
		<View style={{ flex: 1, paddingTop: top }}>
			{scrollBottomInset === undefined ? (
				<View className="flex-1 gap-6 p-4">{content}</View>
			) : (
				<ScrollView
					contentContainerClassName="gap-6 p-4"
					contentContainerStyle={{ paddingBottom: scrollBottomInset }}
				>
					{content}
				</ScrollView>
			)}
		</View>
	);
}
