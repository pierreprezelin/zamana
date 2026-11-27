import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Link, useNavigation } from "expo-router";
import { type ComponentRef, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import SearchField, {
	REMOTE_SEARCH_MAX_LENGTH,
} from "@/components/SearchField";
import StatusCard from "@/components/StatusCard";
import { useTabBarOffset } from "@/components/TabBar";
import { TabScreen } from "@/components/TabScreen";
import Text from "@/components/Text";
import { LoadState } from "@/features/encyclopedia/components/LoadState";
import { TaxonCard } from "@/features/encyclopedia/components/TaxonCard";
import { TaxonListSkeleton } from "@/features/encyclopedia/components/TaxonCardSkeleton";
import {
	CATEGORIES,
	type Category,
	categoryTaxonIds,
} from "@/features/encyclopedia/curatedPlants";
import {
	countPlants,
	fetchTaxa,
	type Taxon,
} from "@/features/encyclopedia/inaturalist";
import { useCachedFetch } from "@/features/encyclopedia/useCachedFetch";
import { useTaxaSearch } from "@/features/encyclopedia/useTaxaSearch";
import { IdentificationSuggestions } from "@/features/identification/components/IdentificationSuggestions";
import {
	isIdentifiedQuery,
	useIdentifiedPhotoStore,
} from "@/features/identification/useIdentifiedPhotoStore";
import { useIdentify } from "@/features/identification/useIdentify";
import { PhotoSourceSheet } from "@/features/plants/components/PhotoSourceSheet";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { locale, pluralForm, t } from "@/utils/i18n";
import { SEARCH_MIN_LENGTH } from "@/utils/useDebouncedSearch";
import { useIsMounted } from "@/utils/useIsMounted";

// Enough to fill the screen, then a hint of the next page at the bottom
const LOADING_CARDS = 6;
const NEXT_PAGE_LOADING_CARDS = 1;

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
	const { width } = useWindowDimensions();
	const listRef = useRef<FlatList<Taxon>>(null);
	const chipsRef = useRef<ComponentRef<typeof ScrollView>>(null);
	const chipLayouts = useRef<
		Partial<Record<Category, { x: number; width: number }>>
	>({});
	const chipsWidth = useRef(0);
	// Centers the chosen tab, so one cut by the screen edge shows whole.
	// iOS does not clamp the offset: the first and last tabs would leave a gap
	const selectCategory = (key: Category) => {
		setCategory(key);
		const layout = chipLayouts.current[key];
		if (layout) {
			const centered = layout.x + layout.width / 2 - width / 2;
			chipsRef.current?.scrollTo({
				x: Math.max(0, Math.min(centered, chipsWidth.current - width)),
			});
		}
	};
	const searching = query.trim().length >= SEARCH_MIN_LENGTH;
	const search = useTaxaSearch(query);
	const popular = useCachedFetch(`popular:${locale()}:${category}`, () =>
		fetchTaxa(categoryTaxonIds(category)),
	);
	const allPlants = useCachedFetch("plantCount", countPlants);
	const photoSheetRef = useRef<BottomSheetModal>(null);
	const identification = useIdentify();
	const suggestions = useIdentifiedPhotoStore((state) => state.suggestions);
	const identified = isIdentifiedQuery(query, suggestions);

	// Leaving the encyclopedia forgets the photo: identifiedPhotoFor only gives it to a suggested species meanwhile
	useEffect(() => () => useIdentifiedPhotoStore.getState().clear(), []);

	const mounted = useIsMounted();
	const typedQuery = useRef(query);
	typedQuery.current = query;

	// A search typed while Pl@ntNet answers wins over the photo
	const identifyPhoto = async (photoUri: string) => {
		const found = await identification.identify(photoUri);
		const best = found?.[0];
		if (!found || !best || !mounted.current || typedQuery.current.trim()) {
			return;
		}
		setQuery(best.scientificName);
		useIdentifiedPhotoStore.getState().identify(photoUri, found);
	};

	// New results start from the top, while the next pages of the same ones keep the scroll
	const shownList = searching ? search.resultQuery : category;
	// biome-ignore lint/correctness/useExhaustiveDependencies: shownList is the trigger, not a value read
	useEffect(() => {
		listRef.current?.scrollToOffset({ offset: 0, animated: false });
	}, [shownList]);

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
		<TabScreen title={t("tabs.encyclopedia")} subtitle={subtitle} showSettings>
			<View className="flex-1 gap-4">
				<SearchField
					value={query}
					onChangeText={setQuery}
					placeholder={t("encyclopedia.searchPlaceholder")}
					maxLength={REMOTE_SEARCH_MAX_LENGTH}
					searchIconReplacement={
						!identification.enabled ? undefined : identification.identifying ? (
							<ActivityIndicator colorClassName="accent-foreground" />
						) : (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel={t("identification.identifyByPhoto")}
								pressedOpacity={0.5}
								hitSlop={13}
								onPress={() => photoSheetRef.current?.present()}
							>
								<Ionicons
									name="scan-outline"
									size={18}
									className="text-foreground"
								/>
							</Pressable>
						)
					}
				/>
				<FlatList
					ref={listRef}
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
									ref={chipsRef}
									onContentSizeChange={(contentWidth) => {
										chipsWidth.current = contentWidth;
									}}
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
											onLayout={({ nativeEvent }) => {
												chipLayouts.current[key] = nativeEvent.layout;
											}}
											onPress={() => selectCategory(key)}
										/>
									))}
								</ScrollView>
							)}
							{searching && identified && (
								<IdentificationSuggestions
									suggestions={suggestions}
									selected={query}
									onSelect={({ scientificName }) => setQuery(scientificName)}
								/>
							)}
							{searching && (
								<Text className="font-recoleta text-card-title text-foreground">
									{t("encyclopedia.results")}
								</Text>
							)}
						</View>
					}
					ListEmptyComponent={
						shown.status === "success" ? (
							searching ? (
								<StatusCard
									icon="search-outline"
									title={t("common.noResult")}
									description={t("encyclopedia.noResult", {
										query: query.trim(),
									})}
								>
									{!identification.enabled && (
										<Link href="/settings/plantnet" asChild>
											<Button
												variant="ghost"
												size="small"
												className="px-0"
												textClassName="text-primary"
												title={t("identification.hint")}
											/>
										</Link>
									)}
								</StatusCard>
							) : (
								<Text className="py-8 text-center text-muted">
									{t("encyclopedia.loadFailed")}
								</Text>
							)
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
							<TaxonListSkeleton count={NEXT_PAGE_LOADING_CARDS} />
						) : undefined
					}
				/>
			</View>
			<PhotoSourceSheet sheetRef={photoSheetRef} onPicked={identifyPhoto} />
		</TabScreen>
	);
}
