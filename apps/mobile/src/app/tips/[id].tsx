import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { ArticleBody } from "@/features/articles/components/ArticleBody";
import { ArticlesUnavailable } from "@/features/articles/components/ArticlesUnavailable";
import { useArticles } from "@/features/articles/useArticles";
import { t } from "@/utils/i18n";

export default function ArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { articles, availability, retry } = useArticles();
	const { bottom } = useSafeAreaInsets();
	const article = articles.find(({ slug }) => slug === id);

	if (availability !== "ready") {
		return <ArticlesUnavailable availability={availability} onRetry={retry} />;
	}

	return (
		<ScrollView
			contentContainerClassName="gap-6 px-4 pt-2"
			contentContainerStyle={{ paddingBottom: bottom + 24 }}
		>
			{article ? (
				<>
					<Text
						accessibilityRole="header"
						className="font-recoleta text-page-title text-foreground"
					>
						{article.title}
					</Text>
					<ArticleBody markdown={article.body} />
				</>
			) : (
				<Text className="py-8 text-center text-muted">
					{t("articles.notFound")}
				</Text>
			)}
		</ScrollView>
	);
}
