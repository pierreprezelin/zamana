import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import SearchField from "@/components/SearchField";
import { useTabBarOffset } from "@/components/TabBar";
import Text from "@/components/Text";
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

type Tab = "current" | "past";

const emptyMessages: Record<Tab, string> = {
	current: "Aucune plante actuelle",
	past: "Aucune plante passée",
};

export default function GardenScreen() {
	const currentPlants = useCurrentPlants();
	const pastPlants = usePastPlants();
	// In the URL so archiving a plant can open the garden on its new tab
	const { tab = "current" } = useLocalSearchParams<{ tab?: Tab }>();
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [query, setQuery] = useState("");
	const tabBarOffset = useTabBarOffset();

	const plantCount = currentPlants.length;
	const hasPlants = plantCount + pastPlants.length > 0;
	const plants = searchPlants(
		tab === "current" ? currentPlants : pastPlants,
		query,
	);
	const tileWidth = useGridTileWidth();

	return (
		<ScreenPlaceholder
			title="Jardin"
			subtitle={
				plantCount
					? `${plantCount} plante${plantCount > 1 ? "s" : ""}`
					: "Aucune plante"
			}
			showSettings
		>
			{hasPlants ? (
				<>
					<View className="gap-4">
						<SearchField
							value={query}
							onChangeText={setQuery}
							placeholder="Rechercher dans mon jardin..."
						/>
						<View className="flex-row items-center justify-between">
							<View accessibilityRole="tablist" className="flex-row gap-2">
								<Chip
									label="Actuelles"
									selected={tab === "current"}
									onPress={() => router.setParams({ tab: "current" })}
								/>
								<Chip
									label="Passées"
									selected={tab === "past"}
									onPress={() => router.setParams({ tab: "past" })}
								/>
							</View>
							<ViewModeToggle value={viewMode} onChange={setViewMode} />
						</View>
					</View>
					<FlatList
						// Scrolls under the tab bar down to the screen edge
						className="-mb-5"
						// numColumns can't change on the fly
						key={viewMode}
						data={plants}
						numColumns={viewMode === "grid" ? GRID_COLUMNS : 1}
						keyExtractor={(plant) => plant.id}
						renderItem={({ item }) =>
							viewMode === "grid" ? (
								<PlantCard plant={item} style={{ width: tileWidth }} />
							) : (
								<PlantListRow plant={item} />
							)
						}
						keyboardDismissMode="on-drag"
						keyboardShouldPersistTaps="handled"
						contentContainerClassName="gap-2"
						contentContainerStyle={{ paddingBottom: tabBarOffset + 20 }}
						columnWrapperClassName={viewMode === "grid" ? "gap-2" : undefined}
						ListEmptyComponent={
							<Text className="py-8 text-center text-muted">
								{query
									? "Aucune plante ne correspond à votre recherche"
									: emptyMessages[tab]}
							</Text>
						}
						ListFooterComponent={
							tab === "current" ? (
								<Link href="/plant/new" asChild>
									<Button
										variant="ghost"
										title="Ajouter une plante"
										icon="add-outline"
									/>
								</Link>
							) : undefined
						}
					/>
				</>
			) : (
				<View
					className="flex-1 justify-center"
					style={{ paddingBottom: tabBarOffset }}
				>
					<EmptyGarden />
				</View>
			)}
		</ScreenPlaceholder>
	);
}
