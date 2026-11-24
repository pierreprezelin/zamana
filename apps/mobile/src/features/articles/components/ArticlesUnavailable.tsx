import { ActivityIndicator, View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";
import type { ArticlesAvailability } from "@/features/articles/useArticleStore";
import { t } from "@/utils/i18n";

type ArticlesUnavailableProps = {
	availability: Exclude<ArticlesAvailability, "ready">;
	onRetry: () => void;
};

export function ArticlesUnavailable({
	availability,
	onRetry,
}: ArticlesUnavailableProps) {
	if (availability === "loading") {
		return (
			<View className="flex-1 items-center justify-center p-4">
				<ActivityIndicator className="accent-primary" />
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center gap-4 p-4">
			<Text className="text-center text-muted">
				{t(availability === "error" ? "articles.loadFailed" : "articles.empty")}
			</Text>
			<Button variant="ghost" title={t("articles.retry")} onPress={onRetry} />
		</View>
	);
}
