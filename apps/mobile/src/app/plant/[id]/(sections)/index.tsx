import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";
import { formatAge } from "@/features/plants/age";
import { ArchiveSheet } from "@/features/plants/components/ArchiveSheet";
import { HelpSheet } from "@/features/plants/components/HelpSheet";
import { InfoCard } from "@/features/plants/components/InfoCard";
import { NeedTile } from "@/features/plants/components/NeedTile";
import { displayName } from "@/features/plants/plantLabels";
import {
	floweringTypeHelp,
	floweringTypeLabels,
	lifespanHelp,
	lifespanLabels,
	locationLabels,
	needs,
	originLabels,
	plantTypeLabels,
	seasonLabels,
} from "@/features/plants/plantOptions";
import { usePlant, usePlantStore } from "@/features/plants/usePlantStore";
import { formatDate } from "@/utils/dates";

export default function PlantInformationScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const plant = usePlant(id);
	const restorePlant = usePlantStore((state) => state.restorePlant);
	const { bottom } = useSafeAreaInsets();
	const archiveSheetRef = useRef<BottomSheetModal>(null);
	const helpSheetRef = useRef<BottomSheetModal>(null);
	const [help, setHelp] = useState(floweringTypeHelp);
	// Stays true until the screen leaves, so the button does not flip to « archive »
	const [restoring, setRestoring] = useState(false);

	if (!plant) return null;

	const showHelp = (content: typeof help) => {
		setHelp(content);
		helpSheetRef.current?.present();
	};

	const restore = async () => {
		setRestoring(true);
		try {
			await restorePlant(plant.id);
			router.dismissTo({ pathname: "/garden", params: { tab: "current" } });
			Toast.show({
				type: "success",
				text1: `${displayName(plant)} est de retour dans votre jardin ! 🌱`,
			});
		} catch {
			setRestoring(false);
			Toast.show({
				type: "error",
				text1: "La restauration a échoué, réessayez",
			});
		}
	};

	const needValue = (need: (typeof needs)[number]) => {
		const level = plant[need.key];
		const value = (need.details ?? need.levels)[level - 1];
		if (need.key !== "temperature") return value;
		return `${value} · ${plant.outdoor ? "Extérieur" : "Intérieur"}`;
	};

	return (
		<>
			<ScrollView
				// grow + mt-auto keep the actions at the bottom when few fields are filled
				contentContainerClassName="grow gap-8 px-5 pt-2.5"
				contentContainerStyle={{ paddingBottom: bottom }}
			>
				{plant.toxic && (
					<View className="flex-row items-center gap-3 rounded-2xl border border-warning bg-warning-tint px-4 py-3.5">
						<Ionicons name="paw-outline" size={20} className="text-warning" />
						<Text className="flex-1 font-outfit-semibold text-warning">
							Toxique pour les animaux en cas d’ingestion.
						</Text>
					</View>
				)}
				<View className="gap-3">
					<Text className="font-recoleta text-xl text-foreground">Besoins</Text>
					<View className="gap-2">
						{[needs.slice(0, 2), needs.slice(2)].map((row) => (
							<View key={row[0].key} className="flex-row gap-2">
								{row.map((need) => (
									<NeedTile
										key={need.key}
										icon={need.icon}
										label={need.label}
										value={needValue(need)}
										level={plant[need.key]}
									/>
								))}
							</View>
						))}
					</View>
				</View>
				<InfoCard
					title="Identité"
					rows={[
						{ label: "Nom", value: plant.name },
						{ label: "Type", value: plant.type && plantTypeLabels[plant.type] },
						{
							label: "Acquise le",
							value: plant.acquiredAt && formatDate(plant.acquiredAt),
						},
						{
							label: "Origine",
							value: plant.origin && originLabels[plant.origin],
						},
						{
							label: "Âge",
							value: plant.bornAt && formatAge(plant.bornAt, new Date()),
						},
						{
							label: "Emplacement",
							value: plant.outdoor
								? "Extérieur"
								: plant.location && locationLabels[plant.location],
						},
					]}
				/>
				<InfoCard
					title="Cycle de vie"
					rows={[
						{
							label: "Floraison",
							value:
								plant.floweringSeasons
									.map((season) => seasonLabels[season])
									.join(", ") || null,
						},
						{
							label: "Type de floraison",
							value:
								plant.floweringType && floweringTypeLabels[plant.floweringType],
							onInfoPress: () => showHelp(floweringTypeHelp),
						},
						{
							label: "Durée de vie",
							value: plant.lifespan && lifespanLabels[plant.lifespan],
							onInfoPress: () => showHelp(lifespanHelp),
						},
					]}
				/>
				{plant.notes && (
					<View className="gap-3">
						<Text className="font-recoleta text-xl text-foreground">Notes</Text>
						<Text className="rounded-2xl border border-line bg-surface p-4 text-foreground">
							{plant.notes}
						</Text>
					</View>
				)}
				<View className="mt-auto gap-2">
					<Link href={`/plant/${plant.id}/edit`} asChild>
						<Button title="Modifier les informations" icon="pencil-outline" />
					</Link>
					{plant.archivedAt || restoring ? (
						<Button
							variant="ghostDanger"
							title="Replacer dans mon jardin"
							loading={restoring}
							onPress={restore}
						/>
					) : (
						<Button
							variant="ghostDanger"
							title="Je n’ai plus cette plante"
							onPress={() => archiveSheetRef.current?.present()}
						/>
					)}
				</View>
			</ScrollView>
			<ArchiveSheet
				ref={archiveSheetRef}
				plant={plant}
				onDone={() => archiveSheetRef.current?.dismiss()}
			/>
			<HelpSheet ref={helpSheetRef} help={help} />
		</>
	);
}
