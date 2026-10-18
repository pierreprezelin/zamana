import { Link } from "expo-router";
import { FlatList, View } from "react-native";
import Text from "@/components/Text";
import { EmptyGarden } from "@/features/plants/components/EmptyGarden";
import { PlantCard } from "@/features/plants/components/PlantCard";
import { useCurrentPlants } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";

export function GardenPreview() {
	const plants = useCurrentPlants();

	return (
		<View className="gap-3">
			<View className="flex-row items-center justify-between">
				<Text className="font-recoleta text-2xl text-foreground">
					{t("garden.title")}
				</Text>
				{plants.length > 0 && (
					<Link href="/garden">
						<Text className="text-muted">{t("garden.seeAll")}</Text>
					</Link>
				)}
			</View>
			{plants.length > 0 ? (
				<FlatList
					horizontal
					data={plants}
					keyExtractor={(plant) => plant.id}
					renderItem={({ item }) => <PlantCard plant={item} className="w-32" />}
					showsHorizontalScrollIndicator={false}
					// Bleeds to the screen edges like the design
					className="-mx-5"
					contentContainerClassName="gap-2 px-5"
				/>
			) : (
				<View className="rounded-2xl bg-primary-tint p-6">
					<EmptyGarden iconBackgroundClassName="bg-surface" />
				</View>
			)}
		</View>
	);
}
