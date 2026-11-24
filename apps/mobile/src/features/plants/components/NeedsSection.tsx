import { View } from "react-native";
import Text from "@/components/Text";
import { NeedTile } from "@/features/plants/components/NeedTile";
import {
	needs,
	needValue,
	type PlantNeeds,
} from "@/features/plants/plantOptions";
import { t } from "@/utils/i18n";

export function NeedsSection({ plant }: { plant: PlantNeeds }) {
	return (
		<View className="gap-3">
			<Text className="font-recoleta text-xl text-foreground">
				{t("plant.info.needs")}
			</Text>
			<View className="gap-2">
				{[needs.slice(0, 2), needs.slice(2)].map((row) => (
					<View key={row[0]?.key} className="flex-row gap-2">
						{row.map((need) => (
							<NeedTile
								key={need.key}
								icon={need.icon}
								label={need.label}
								value={needValue(need, plant)}
								level={plant[need.key]}
							/>
						))}
					</View>
				))}
			</View>
		</View>
	);
}
