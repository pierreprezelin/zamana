import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import {
	ARTICLE_CATEGORIES,
	type ArticleCategory,
} from "@/features/articles/articles";
import { ArticleRow } from "@/features/articles/components/ArticleRow";
import { ArticlesUnavailable } from "@/features/articles/components/ArticlesUnavailable";
import { useArticles } from "@/features/articles/useArticles";
import { t } from "@/utils/i18n";
import { isOneOf } from "@/utils/isOneOf";

const isCategory = (id: string | undefined): id is ArticleCategory =>
	isOneOf(ARTICLE_CATEGORIES, id);

export default function ArticleCategoryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { articles, availability, retry } = useArticles();
	const { bottom } = useSafeAreaInsets();
	const inCategory = useMemo(
		() => articles.filter((article) => article.category === id),
		[articles, id],
	);

	return (
		<>
			<Stack.Screen
				options={{
					title: isCategory(id) ? t(`articles.categories.${id}`) : "",
				}}
			/>
			{!isCategory(id) ? (
				<Text className="py-8 text-center text-muted">
					{t("articles.categoryNotFound")}
				</Text>
			) : availability !== "ready" ? (
				<ArticlesUnavailable availability={availability} onRetry={retry} />
			) : (
				<FlatList
					data={inCategory}
					keyExtractor={(article) => article.slug}
					renderItem={({ item }) => <ArticleRow article={item} />}
					contentContainerClassName="gap-2 p-4"
					contentContainerStyle={{ paddingBottom: bottom + 16 }}
					ListEmptyComponent={
						<Text className="py-8 text-center text-muted">
							{t("articles.emptyCategory")}
						</Text>
					}
				/>
			)}
		</>
	);
}
