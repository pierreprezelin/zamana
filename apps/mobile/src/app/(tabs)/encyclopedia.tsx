import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import Chip from "@/components/Chip";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import SearchField from "@/components/SearchField";
import { useTabBarOffset } from "@/components/TabBar";
import Text from "@/components/Text";
import { LoadState } from "@/features/encyclopedia/components/LoadState";
import { TaxonCard } from "@/features/encyclopedia/components/TaxonCard";
import { TaxonListSkeleton } from "@/features/encyclopedia/components/TaxonCardSkeleton";
import {
	CATEGORIES,
	type Category,
	categoryTaxonIds,
} from "@/features/encyclopedia/curatedPlants";
import { countPlants, fetchTaxa } from "@/features/encyclopedia/inaturalist";
import { useCachedFetch } from "@/features/encyclopedia/useCachedFetch";
import { useTaxaSearch } from "@/features/encyclopedia/useTaxaSearch";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { locale, pluralForm, t } from "@/utils/i18n";
import { SEARCH_MIN_LENGTH } from "@/utils/useDebouncedSearch";

// Enough to fill the screen, then a hint of the next page at the bottom
const LOADING_CARDS = 6;
const NEXT_PAGE_LOADING_CARDS = 2;

const plantCount = (amount: number) =>
	t(`garden.plantCount.${pluralForm(amount)}`, {
		amount: amount.toLocaleString(locale()),
	});

// Leaving the tab, or adding a plant, starts the whole screen over: search, tab and scroll.
// Opening a result and coming back keeps it, the result showing above the tab.
export default function EncyclopediaScreen() {
	const navigation = useNavigation();
	const [generation, setGeneration] = useState(0);
	const latestPlantAddedAt = usePlantStore(
		(state) => state.plants[0]?.createdAt,
	);
	const [seenPlantAddedAt, setSeenPlantAddedAt] = useState(latestPlantAddedAt);

	if (latestPlantAddedAt !== seenPlantAddedAt) {
		setSeenPlantAddedAt(latestPlantAddedAt);
		setGeneration((count) => count + 1);
	}

	useEffect(
		() =>
			navigation.addListener("blur", () => {
				const tabs = navigation.getState();
				if (tabs && tabs.routes[tabs.index]?.name !== "encyclopedia") {
					setGeneration((count) => count + 1);
				}
			}),
		[navigation],
	);

	return <Encyclopedia key={generation} />;
}

function Encyclopedia() {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<Category>("popular");
	const tabBarOffset = useTabBarOffset();
	const searching = query.trim().length >= SEARCH_MIN_LENGTH;
	const search = useTaxaSearch(query);
	const popular = useCachedFetch(`popular:${locale()}:${category}`, () =>
		fetchTaxa(categoryTaxonIds(category)),
	);
	const allPlants = useCachedFetch("plantCount", countPlants);

	const shown = searching
		? {
				status: search.status,
				taxa: search.taxa,
				retry: search.retry,
				total: search.total,
			}
		: {
				status: popular.status,
				taxa: popular.data ?? [],
				retry: popular.retry,
				total: allPlants.data,
			};
	const countStatus = searching ? search.status : allPlants.status;

	const subtitle =
		countStatus === "success" && shown.total !== null
			? plantCount(shown.total)
			: countStatus === "error"
				? undefined
				: t("encyclopedia.counting");

	return (
		<ScreenPlaceholder
			title={t("tabs.encyclopedia")}
			subtitle={subtitle}
			showSettings
		>
			<View className="flex-1 gap-4">
				<SearchField
					value={query}
					onChangeText={setQuery}
					placeholder={t("encyclopedia.searchPlaceholder")}
				/>
				<FlatList
					// Scrolls under the tab bar down to the screen edge, its scroll bar along the screen side
					className="-mx-4 -mb-4"
					// The previous results stay while the next search loads, rather than flashing an empty list
					data={shown.taxa}
					keyExtractor={(taxon) => String(taxon.id)}
					renderItem={({ item }) => (
						<TaxonCard
							taxon={item}
							photoLoading={searching && search.isPhotoLoading(item.id)}
						/>
					)}
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					contentContainerClassName="gap-2 px-4"
					contentContainerStyle={{ paddingBottom: tabBarOffset + 16 }}
					onEndReached={searching ? search.loadMore : undefined}
					onEndReachedThreshold={0.5}
					ListHeaderComponent={
						<View className="gap-6 pb-2">
							{!searching && (
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									accessibilityRole="tablist"
									className="-mx-4"
									contentContainerClassName="gap-2 px-4"
								>
									{CATEGORIES.map((key) => (
										<Chip
											key={key}
											label={t(`encyclopedia.categories.${key}`)}
											selected={category === key}
											onPress={() => setCategory(key)}
										/>
									))}
								</ScrollView>
							)}
							{searching && (
								<Text className="font-recoleta text-xl text-foreground">
									{t("encyclopedia.results")}
								</Text>
							)}
						</View>
					}
					ListEmptyComponent={
						shown.status === "success" ? (
							<Text className="py-8 text-center text-muted">
								{searching
									? t("encyclopedia.noResult", { query: query.trim() })
									: t("encyclopedia.loadFailed")}
							</Text>
						) : shown.status === "error" ? (
							<LoadState failed onRetry={shown.retry} />
						) : (
							<TaxonListSkeleton count={LOADING_CARDS} />
						)
					}
					ListFooterComponent={
						!searching ? undefined : search.moreFailed ? (
							<LoadState failed onRetry={search.retryMore} />
						) : search.loadingMore ? (
							<View className="pt-2">
								<TaxonListSkeleton count={NEXT_PAGE_LOADING_CARDS} />
							</View>
						) : undefined
					}
				/>
			</View>
		</ScreenPlaceholder>
	);
}
