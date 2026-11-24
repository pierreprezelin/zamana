import { Link } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { type Article, categoryIcons } from "@/features/articles/articles";
import { t } from "@/utils/i18n";

type ArticleRowProps = {
	article: Article;
	// Useful among search results, repeated within a category
	showCategory?: boolean;
};

export const ArticleRow = memo(function ArticleRow({
	article,
	showCategory = false,
}: ArticleRowProps) {
	return (
		<Link
			href={{ pathname: "/tips/[id]", params: { id: article.slug } }}
			asChild
		>
			<Pressable
				accessibilityRole="button"
				pressedOpacity={0.75}
				className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4"
			>
				{showCategory && (
					<View className="size-10 items-center justify-center rounded-xl bg-primary-tint">
						<Ionicons
							name={categoryIcons[article.category]}
							size={20}
							className="text-primary"
						/>
					</View>
				)}
				<View className="flex-1">
					<Text className="font-outfit-semibold text-foreground">
						{article.title}
					</Text>
					{showCategory && (
						<Text className="text-sm text-muted">
							{t(`articles.categories.${article.category}`)}
						</Text>
					)}
				</View>
				<Ionicons name="chevron-forward" size={20} className="text-muted" />
			</Pressable>
		</Link>
	);
});
