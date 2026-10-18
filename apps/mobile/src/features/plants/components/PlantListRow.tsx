import { Link } from "expo-router";
import { View } from "react-native";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { displayName } from "@/features/plants/plantLabels";
import { archiveReasonLabel } from "@/features/plants/plantOptions";
import type { Plant } from "@/features/plants/plantSchema";

export function PlantListRow({ plant }: { plant: Plant }) {
	return (
		<Link href={`/plant/${plant.id}`} asChild>
			<Pressable
				accessibilityRole="button"
				pressedClassName=""
				pressedOpacity={0.75}
				className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface p-3"
			>
				<PlantPhoto photo={plant.photo} className="size-16" />
				<View className="flex-1">
					<Text
						numberOfLines={1}
						className="font-recoleta text-xl text-foreground"
					>
						{displayName(plant)}
					</Text>
					{plant.scientificName && (
						<Text numberOfLines={1} className="text-base text-foreground">
							{plant.scientificName}
						</Text>
					)}
					{plant.archiveReason && (
						<Text numberOfLines={1} className="text-xs text-muted">
							{archiveReasonLabel(plant.archiveReason)}
						</Text>
					)}
				</View>
			</Pressable>
		</Link>
	);
}
