import { Link } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

type TabScreenProps = {
	title: string;
	subtitle?: string;
	headerAction?: ReactNode;
	showSettings?: boolean;
	// Scrolls the content, clearing this bottom space (the floating tab bar)
	scrollBottomInset?: number;
	children?: ReactNode;
};

export function TabScreen({
	title,
	subtitle,
	headerAction,
	showSettings = false,
	scrollBottomInset,
	children,
}: TabScreenProps) {
	const { top } = useSafeAreaInsets();
	const content = (
		<>
			<View className="flex-row items-start justify-between gap-4">
				<View className="flex-1">
					<Text className="font-recoleta text-page-title text-foreground">
						{title}
					</Text>
					{subtitle && <Text className="text-base text-muted">{subtitle}</Text>}
				</View>
				<View className="-mr-2 flex-row">
					{headerAction}
					{showSettings && (
						<Link href="/settings" asChild>
							<HeaderIconButton
								icon="settings-outline"
								accessibilityLabel={t("common.settings")}
							/>
						</Link>
					)}
				</View>
			</View>
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
