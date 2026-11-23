import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import CreditLink from "@/components/CreditLink";
import Text from "@/components/Text";
import WarningBanner from "@/components/WarningBanner";
import { LimitedInfoNote } from "@/features/encyclopedia/components/LimitedInfoNote";
import { LoadState } from "@/features/encyclopedia/components/LoadState";
import { TaxonDetailSkeleton } from "@/features/encyclopedia/components/TaxonDetailSkeleton";
import { curatedPlant } from "@/features/encyclopedia/curatedPlants";
import { fetchTaxon } from "@/features/encyclopedia/inaturalist";
import { prefillParams } from "@/features/encyclopedia/plantPrefill";
import { useCachedFetch } from "@/features/encyclopedia/useCachedFetch";
import { HelpSheet } from "@/features/plants/components/HelpSheet";
import { InfoCard } from "@/features/plants/components/InfoCard";
import { NeedsSection } from "@/features/plants/components/NeedsSection";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import {
	floweringTypeHelp,
	floweringTypeLabel,
	lifespanHelp,
	lifespanLabel,
	plantTypeLabel,
	seasonLabel,
} from "@/features/plants/plantOptions";
import { locale, t } from "@/utils/i18n";

export default function EncyclopediaResultScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const taxonId = Number(id);
	const { bottom } = useSafeAreaInsets();
	const helpSheetRef = useRef<BottomSheetModal>(null);
	const [help, setHelp] = useState(floweringTypeHelp);
	const {
		status,
		data: taxon,
		retry,
	} = useCachedFetch(`taxon:${locale()}:${id}`, () =>
		Number.isInteger(taxonId) ? fetchTaxon(taxonId) : Promise.resolve(null),
	);

	if (status === "error") {
		return (
			<View className="px-4">
				<LoadState failed onRetry={retry} />
			</View>
		);
	}
	if (status !== "success") {
		return <TaxonDetailSkeleton />;
	}
	if (!taxon) {
		return (
			<Text className="p-4 text-center text-muted">
				{t("encyclopedia.notFound")}
			</Text>
		);
	}

	const curated = curatedPlant(taxon.id);
	const showHelp = (content: typeof help) => {
		setHelp(content);
		helpSheetRef.current?.present();
	};

	return (
		<>
			<Stack.Screen options={{ title: taxon.name }} />
			<ScrollView contentContainerClassName="gap-6 px-4 pt-2.5 pb-3.5">
				<View className="gap-4">
					<View className="gap-1">
						<PlantPhoto
							url={taxon.photo?.largeUrl}
							iconSize={48}
							className="aspect-[4/3] w-full rounded-2xl"
						/>
						{taxon.photo && (
							<CreditLink
								label={taxon.photo.attribution}
								url={taxon.photo.pageUrl}
								numberOfLines={2}
							/>
						)}
					</View>
					<View>
						<Text className="font-recoleta text-[28px] leading-[1.25] text-foreground">
							{taxon.name}
						</Text>
						<Text className="text-base text-muted">{taxon.scientificName}</Text>
						{taxon.family && (
							<Text className="text-xs text-muted">
								{t("encyclopedia.family", { name: taxon.family })}
							</Text>
						)}
					</View>
				</View>
				{curated?.toxic && (
					<WarningBanner icon="paw-outline" message={t("plant.info.toxic")} />
				)}
				{curated && <NeedsSection plant={curated} />}
				{(!curated || !taxon.photo) && (
					<View className="gap-2">
						{!curated && <LimitedInfoNote />}
						{!taxon.photo && (
							<LimitedInfoNote message={t("encyclopedia.noFreePhoto")} />
						)}
					</View>
				)}
				<InfoCard
					title={t("plant.info.identity")}
					rows={[
						{
							label: t("plant.info.type"),
							value: taxon.guessedType && plantTypeLabel(taxon.guessedType),
						},
						{ label: t("plant.info.name"), value: taxon.name },
						{
							label: t("plant.form.scientificName"),
							value: taxon.scientificName,
						},
					]}
				/>
				{curated && (
					<InfoCard
						title={t("plant.info.lifecycle")}
						rows={[
							{
								label: t("plant.info.flowering"),
								value:
									curated.floweringSeasons.map(seasonLabel).join(", ") || null,
							},
							{
								label: t("plant.info.floweringType"),
								value:
									curated.floweringType &&
									floweringTypeLabel(curated.floweringType),
								onInfoPress: () => showHelp(floweringTypeHelp),
							},
							{
								label: t("plant.info.lifespan"),
								value: lifespanLabel(curated.lifespan),
								onInfoPress: () => showHelp(lifespanHelp),
							},
						]}
					/>
				)}
				<Text className="text-center text-xs text-muted">
					{t("encyclopedia.source")}
				</Text>
			</ScrollView>
			<View
				className="gap-2 bg-background px-4 pt-2.5"
				style={{ paddingBottom: bottom }}
			>
				<Link
					href={{ pathname: "/plant/new", params: prefillParams(taxon) }}
					asChild
				>
					<Button title={t("encyclopedia.addToGarden")} icon="add-outline" />
				</Link>
			</View>
			<HelpSheet ref={helpSheetRef} help={help} />
		</>
	);
}
