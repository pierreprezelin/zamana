import { Link } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import {
	type ArticleCategory,
	categoryIcons,
} from "@/features/articles/articles";
import { pluralForm, t } from "@/utils/i18n";

type CategoryCardProps = {
	category: ArticleCategory;
	count: number;
};

export function CategoryCard({ category, count }: CategoryCardProps) {
	return (
		<Link href={`/tips/category/${category}`} asChild>
			<Pressable
				accessibilityRole="button"
				pressedClassName=""
				pressedOpacity={0.75}
				className="flex-1 flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4"
			>
				<View className="size-10 items-center justify-center rounded-xl bg-primary-tint">
					<Ionicons
						name={categoryIcons[category]}
						size={20}
						className="text-primary"
					/>
				</View>
				<View className="flex-1">
					<Text className="font-outfit-semibold text-base text-foreground">
						{t(`articles.categories.${category}`)}
					</Text>
					<Text className="text-sm text-muted">
						{t(`articles.count.${pluralForm(count)}`, { amount: count })}
					</Text>
				</View>
			</Pressable>
		</Link>
	);
}
