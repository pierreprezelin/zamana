import { Link } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import type { Taxon } from "@/features/encyclopedia/inaturalist";
import { prefillParams } from "@/features/encyclopedia/plantPrefill";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { t } from "@/utils/i18n";

// Two side by side buttons, not nested, so screen readers reach the add one
type TaxonCardProps = { taxon: Taxon; photoLoading?: boolean };

export const TaxonCard = memo(function TaxonCard({
	taxon,
	photoLoading = false,
}: TaxonCardProps) {
	return (
		<View className="flex-row items-center rounded-2xl border border-line bg-surface">
			<Link href={`/encyclopedia/${taxon.id}`} asChild>
				<Pressable
					accessibilityRole="button"
					pressedOpacity={0.75}
					className="flex-1 flex-row items-center gap-3 py-4 pl-4"
				>
					<PlantPhoto
						url={taxon.photo?.thumbnailUrl}
						loading={photoLoading}
						className="size-16 rounded-2xl"
					/>
					<View className="flex-1">
						<Text
							numberOfLines={1}
							className="font-recoleta text-xl text-foreground"
						>
							{taxon.name}
						</Text>
						<Text numberOfLines={1} className="text-sm text-muted">
							{taxon.scientificName}
						</Text>
					</View>
				</Pressable>
			</Link>
			<Link
				href={{ pathname: "/plant/new", params: prefillParams(taxon) }}
				asChild
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={t("encyclopedia.addNamed", { name: taxon.name })}
					pressedOpacity={0.5}
					className="self-stretch justify-center px-4"
				>
					<View className="size-9 items-center justify-center rounded-xl bg-primary-tint">
						<Ionicons name="add" size={20} className="text-primary" />
					</View>
				</Pressable>
			</Link>
		</View>
	);
});
