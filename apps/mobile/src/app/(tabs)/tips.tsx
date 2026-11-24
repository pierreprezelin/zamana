import { useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import SearchField from "@/components/SearchField";
import { useTabBarOffset } from "@/components/TabBar";
import { TabScreen } from "@/components/TabScreen";
import Text from "@/components/Text";
import {
	ARTICLE_CATEGORIES,
	countByCategory,
	searchArticles,
} from "@/features/articles/articles";
import { ArticleRow } from "@/features/articles/components/ArticleRow";
import { ArticlesUnavailable } from "@/features/articles/components/ArticlesUnavailable";
import { CategoryCard } from "@/features/articles/components/CategoryCard";
import { useArticles } from "@/features/articles/useArticles";
import { pluralForm, t } from "@/utils/i18n";

const CARDS_PER_ROW = 2;
const categoryRows = Array.from(
	{ length: Math.ceil(ARTICLE_CATEGORIES.length / CARDS_PER_ROW) },
	(_, row) =>
		ARTICLE_CATEGORIES.slice(row * CARDS_PER_ROW, (row + 1) * CARDS_PER_ROW),
);

export default function TipsScreen() {
	const { articles, availability, retry } = useArticles();
	const [query, setQuery] = useState("");
	const tabBarOffset = useTabBarOffset();
	const counts = useMemo(() => countByCategory(articles), [articles]);
	const results = useMemo(
		() => searchArticles(articles, query),
		[articles, query],
	);
	const shownCount = query.trim() ? results.length : articles.length;

	return (
		<TabScreen
			title={t("tabs.tips")}
			subtitle={
				availability === "ready"
					? t(`articles.count.${pluralForm(shownCount)}`, {
							amount: shownCount,
						})
					: undefined
			}
			showSettings
		>
			{availability !== "ready" ? (
				<ArticlesUnavailable availability={availability} onRetry={retry} />
			) : (
				<>
					<SearchField
						value={query}
						onChangeText={setQuery}
						placeholder={t("articles.searchPlaceholder")}
					/>
					{query.trim() ? (
						<FlatList
							// Scrolls under the tab bar down to the screen edge, its scroll bar along the screen side
							className="-mx-4 -mb-4"
							data={results}
							keyExtractor={(article) => article.slug}
							renderItem={({ item }) => (
								<ArticleRow article={item} showCategory />
							)}
							keyboardDismissMode="on-drag"
							keyboardShouldPersistTaps="handled"
							contentContainerClassName="gap-2 px-4"
							contentContainerStyle={{ paddingBottom: tabBarOffset + 16 }}
							ListEmptyComponent={
								<Text className="py-8 text-center text-muted">
									{t("articles.noSearchResult")}
								</Text>
							}
						/>
					) : (
						<ScrollView
							className="-mx-4 -mb-4"
							contentContainerClassName="gap-4 px-4"
							contentContainerStyle={{ paddingBottom: tabBarOffset + 16 }}
						>
							<Text className="font-recoleta text-xl text-foreground">
								{t("articles.categoriesTitle")}
							</Text>
							<View className="gap-2">
								{categoryRows.map((row) => (
									<View key={row.join()} className="flex-row gap-2">
										{row.map((category) => (
											<CategoryCard
												key={category}
												category={category}
												count={counts[category]}
											/>
										))}
									</View>
								))}
							</View>
						</ScrollView>
					)}
				</>
			)}
		</TabScreen>
	);
}
