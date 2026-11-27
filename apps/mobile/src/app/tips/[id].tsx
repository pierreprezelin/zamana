import { Stack, useLocalSearchParams } from "expo-router";
import type { ScrollViewInstance } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	FadingHeaderTitle,
	useFadingHeaderTitle,
} from "@/components/FadingHeaderTitle";
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
	const fadingTitle = useFadingHeaderTitle<ScrollViewInstance>();

	if (availability !== "ready") {
		return <ArticlesUnavailable availability={availability} onRetry={retry} />;
	}

	return (
		<Animated.ScrollView
			ref={fadingTitle.containerRef}
			onScroll={fadingTitle.onScroll}
			scrollEventThrottle={16}
			contentContainerClassName="gap-6 px-4 pt-2"
			contentContainerStyle={{ paddingBottom: bottom + 24 }}
		>
			{article ? (
				<>
					<Stack.Screen
						options={{
							headerTitle: () => (
								<FadingHeaderTitle
									title={article.title}
									scrollY={fadingTitle.scrollY}
									titleTop={fadingTitle.titleTop}
									titleBottom={fadingTitle.titleBottom}
								/>
							),
						}}
					/>
					<Text
						ref={fadingTitle.titleRef}
						onLayout={fadingTitle.onTitleLayout}
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
		</Animated.ScrollView>
	);
}
