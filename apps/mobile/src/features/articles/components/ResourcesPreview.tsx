import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import {
	ARTICLE_CATEGORIES,
	categoryIcons,
} from "@/features/articles/articles";
import { t } from "@/utils/i18n";

export function ResourcesPreview() {
	return (
		<View className="gap-3">
			<View className="flex-row items-center justify-between">
				<Text className="font-recoleta text-2xl text-foreground">
					{t("resources.title")}
				</Text>
				<Link href="/tips">
					<Text className="text-muted">{t("resources.seeMore")}</Text>
				</Link>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				// Bleeds to the screen edges like the garden preview
				className="-mx-4"
				contentContainerClassName="gap-2 px-4"
			>
				{ARTICLE_CATEGORIES.map((category) => (
					<Link key={category} href={`/tips/category/${category}`} asChild>
						<Pressable
							accessibilityRole="button"
							pressedClassName=""
							pressedOpacity={0.75}
							className="h-10 flex-row items-center gap-3 rounded-xl border border-line bg-surface px-3"
						>
							<Text className="text-sm text-foreground">
								{t(`articles.categories.${category}`)}
							</Text>
							<Ionicons
								name={categoryIcons[category]}
								size={20}
								className="text-primary"
							/>
						</Pressable>
					</Link>
				))}
			</ScrollView>
		</View>
	);
}
