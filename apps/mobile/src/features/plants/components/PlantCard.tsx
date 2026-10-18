import { Link } from "expo-router";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { twMerge } from "tailwind-merge";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { displayName } from "@/features/plants/plantLabels";
import { archiveReasonLabels } from "@/features/plants/plantOptions";
import type { Plant } from "@/features/plants/plantSchema";

type PlantCardProps = {
	plant: Plant;
	className?: string;
	style?: StyleProp<ViewStyle>;
};

export function PlantCard({ plant, className, style }: PlantCardProps) {
	return (
		<Link href={`/plant/${plant.id}`} asChild>
			<Pressable
				accessibilityRole="button"
				pressedClassName=""
				pressedOpacity={0.75}
				className={twMerge("gap-2", className)}
				style={style}
			>
				<PlantPhoto
					photo={plant.photo}
					iconSize={32}
					className="aspect-square w-full rounded-2xl"
				/>
				<View>
					<Text
						numberOfLines={1}
						className="font-outfit-semibold text-foreground"
					>
						{displayName(plant)}
					</Text>
					{plant.scientificName && (
						<Text numberOfLines={1} className="text-foreground">
							{plant.scientificName}
						</Text>
					)}
					{plant.archiveReason && (
						<Text numberOfLines={1} className="text-xs text-muted">
							{archiveReasonLabels[plant.archiveReason]}
						</Text>
					)}
				</View>
			</Pressable>
		</Link>
	);
}
