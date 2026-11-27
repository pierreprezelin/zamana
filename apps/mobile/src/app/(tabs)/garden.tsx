import { Link, router, useIsFocused, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import Chip from "@/components/Chip";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import SearchField from "@/components/SearchField";
import StatusCard from "@/components/StatusCard";
import { useTabBarOffset } from "@/components/TabBar";
import { TabScreen } from "@/components/TabScreen";
import Text from "@/components/Text";
import { groupCaresByPlant, nextCare } from "@/features/care/careSchedule";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import { EmptyGarden } from "@/features/plants/components/EmptyGarden";
import { PlantCard } from "@/features/plants/components/PlantCard";
import { PlantListRow } from "@/features/plants/components/PlantListRow";
import {
	type ViewMode,
	ViewModeToggle,
} from "@/features/plants/components/ViewModeToggle";
import { searchPlants } from "@/features/plants/searchPlants";
import {
	GRID_COLUMNS,
	useGridTileWidth,
} from "@/features/plants/useGridTileWidth";
import {
	useCurrentPlants,
	usePastPlants,
} from "@/features/plants/usePlantStore";
import { toISODate } from "@/utils/dates";
import { pluralForm, t } from "@/utils/i18n";

type Tab = "current" | "past";

const emptyMessages: Record<Tab, string> = {
	current: t("garden.noCurrentPlant"),
	past: t("garden.noPastPlant"),
};

export default function GardenScreen() {
	const currentPlants = useCurrentPlants();
	const pastPlants = usePastPlants();
	// In the URL so archiving a plant can open the garden on its new tab
	const params = useLocalSearchParams<{ tab?: string }>();
	const tab: Tab = params.tab === "past" ? "past" : "current";
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [query, setQuery] = useState("");
	const tabBarOffset = useTabBarOffset();
	const cares = useCareStore((state) => state.cares);
	const climate = useCarePreferencesStore((state) => state.climate);
	// Re-renders on focus, so a screen left open overnight catches up with the date
	useIsFocused();
	const today = toISODate(new Date());
	// Once for the whole list, not in every row
	const nextCares = useMemo(() => {
		const caresByPlant = groupCaresByPlant(cares);
		return new Map(
			currentPlants.map((plant) => [
				plant.id,
				nextCare(
					caresByPlant.get(plant.id) ?? [],
					{ wateringLevel: plant.watering, climate },
					today,
				),
			]),
		);
	}, [cares, currentPlants, climate, today]);

	const tabPlants = tab === "current" ? currentPlants : pastPlants;
	const plantCount = tabPlants.length;
	const hasPlants = currentPlants.length + pastPlants.length > 0;
	const plants = searchPlants(tabPlants, query);
	const tileWidth = useGridTileWidth();

	return (
		<TabScreen
			title={t("garden.title")}
			subtitle={
				plantCount
					? t(`garden.plantCount.${pluralForm(plantCount)}`, {
							amount: plantCount,
						})
					: t("garden.noPlant")
			}
			headerAction={
				<Link href="/plant/new" asChild>
					<HeaderIconButton
						icon="add-outline"
						accessibilityLabel={t("garden.addPlant")}
					/>
				</Link>
			}
			showSettings
		>
			{hasPlants ? (
				<View className="flex-1 gap-4">
					<View className="gap-4">
						<SearchField
							value={query}
							onChangeText={setQuery}
							placeholder={t("garden.searchPlaceholder")}
						/>
						<View className="flex-row items-center justify-between">
							<View accessibilityRole="tablist" className="flex-row gap-2">
								<Chip
									label={t("garden.current")}
									selected={tab === "current"}
									onPress={() => router.setParams({ tab: "current" })}
								/>
								<Chip
									label={t("garden.past")}
									selected={tab === "past"}
									onPress={() => router.setParams({ tab: "past" })}
								/>
							</View>
							<ViewModeToggle value={viewMode} onChange={setViewMode} />
						</View>
					</View>
					<FlatList
						// Scrolls under the tab bar down to the screen edge, its scroll bar along the screen side
						className="-mx-4 -mb-4"
						// numColumns can't change on the fly, and a new tab starts fresh (a background data swap left it blank)
						key={`${viewMode}-${tab}`}
						data={plants}
						initialNumToRender={10}
						windowSize={7}
						numColumns={viewMode === "grid" ? GRID_COLUMNS : 1}
						keyExtractor={(plant) => plant.id}
						renderItem={({ item }) =>
							viewMode === "grid" ? (
								<PlantCard plant={item} style={{ width: tileWidth }} />
							) : (
								<PlantListRow
									plant={item}
									nextCare={nextCares.get(item.id)}
									today={today}
								/>
							)
						}
						keyboardDismissMode="on-drag"
						keyboardShouldPersistTaps="handled"
						contentContainerClassName={
							viewMode === "grid" || !plants.length
								? "gap-4 px-4"
								: "gap-2 px-4"
						}
						contentContainerStyle={{ paddingBottom: tabBarOffset + 16 }}
						columnWrapperClassName={viewMode === "grid" ? "gap-2" : undefined}
						ListEmptyComponent={
							query ? (
								<StatusCard
									icon="search-outline"
									title={t("common.noResult")}
									description={t("garden.noSearchResult")}
								/>
							) : (
								<Text className="py-8 text-center text-muted">
									{emptyMessages[tab]}
								</Text>
							)
						}
					/>
				</View>
			) : (
				<View
					className="flex-1 justify-center"
					style={{ paddingBottom: tabBarOffset }}
				>
					<EmptyGarden />
				</View>
			)}
		</TabScreen>
	);
}
