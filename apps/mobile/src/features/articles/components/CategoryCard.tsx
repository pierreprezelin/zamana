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
				className="flex-1 gap-4 rounded-2xl border border-line bg-surface p-4"
			>
				<View className="flex-row items-start justify-between gap-2">
					<View className="size-10 items-center justify-center rounded-xl bg-primary-tint">
						<Ionicons
							name={categoryIcons[category]}
							size={20}
							className="text-primary"
						/>
					</View>
					<Text className="text-sm text-muted">
						{t(`articles.count.${pluralForm(count)}`, { amount: count })}
					</Text>
				</View>
				<View>
					<Text className="font-outfit-semibold text-base text-foreground">
						{t(`articles.categories.${category}`)}
					</Text>
					<Text numberOfLines={2} className="text-sm text-muted">
						{t(`articles.categoryDescriptions.${category}`)}
					</Text>
				</View>
			</Pressable>
		</Link>
	);
}
