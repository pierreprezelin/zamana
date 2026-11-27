import { ScrollView, View } from "react-native";
import Chip from "@/components/Chip";
import CreditLink from "@/components/CreditLink";
import {
	PLANTNET_URL,
	type Suggestion,
} from "@/features/identification/plantnet";
import { locale, t } from "@/utils/i18n";

type IdentificationSuggestionsProps = {
	suggestions: Suggestion[];
	selected: string;
	onSelect: (suggestion: Suggestion) => void;
};

const percent = (score: number) =>
	score.toLocaleString(locale(), { style: "percent" });

export function IdentificationSuggestions({
	suggestions,
	selected,
	onSelect,
}: IdentificationSuggestionsProps) {
	return (
		<View className="gap-2">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				accessibilityRole="tablist"
				contentContainerClassName="gap-2"
			>
				{suggestions.map((suggestion) => (
					<Chip
						key={suggestion.scientificName}
						label={`${suggestion.scientificName} · ${percent(suggestion.score)}`}
						selected={suggestion.scientificName === selected.trim()}
						onPress={() => onSelect(suggestion)}
					/>
				))}
			</ScrollView>
			<View className="items-start">
				<CreditLink label={t("identification.credit")} url={PLANTNET_URL} />
			</View>
		</View>
	);
}
