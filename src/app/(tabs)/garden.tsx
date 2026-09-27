import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import Text from "@/components/Text";

export default function GardenScreen() {
	// ponytail: hardcoded until the plants come from the database
	const [plantCount] = useState(0);

	return (
		<ScreenPlaceholder
			title="Jardin"
			subtitle={`${plantCount} plante${plantCount > 1 ? "s" : ""}`}
			showSettings
			links={
				plantCount > 0
					? [
							{ label: "Plante #1", href: "/plant/1" },
							{ label: "Ajouter une plante", href: "/plant/new" },
						]
					: []
			}
		>
			{plantCount === 0 && (
				<View className="flex-1 items-center justify-center gap-6">
					<View className="size-16 items-center justify-center rounded-full bg-line">
						<Ionicons
							name="file-tray-outline"
							size={26}
							className="text-forest"
						/>
					</View>
					<Text className="w-[280px] text-center font-recoleta text-[20px] text-moss">
						Il n'y a pas encore de plante dans votre jardin
					</Text>
					<Link href="/plant/new" asChild>
						<Button title="Ajouter ma première plante" icon="add-outline" />
					</Link>
				</View>
			)}
		</ScreenPlaceholder>
	);
}
