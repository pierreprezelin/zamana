import { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";

const LEVELS = [1, 2, 3];

type NeedTileProps = {
	icon: IoniconsIconName;
	label: string;
	value: string;
	level: number;
};

export function NeedTile({ icon, label, value, level }: NeedTileProps) {
	return (
		<View
			accessible
			accessibilityLabel={`${label} : ${value}`}
			className="flex-1 gap-3 rounded-2xl border border-line bg-surface p-4"
		>
			<View className="size-10 items-center justify-center rounded-xl bg-primary-tint">
				<Ionicons name={icon} size={20} className="text-primary" />
			</View>
			<View className="flex-1">
				<Text className="text-xs text-muted">{label}</Text>
				<Text className="font-outfit-semibold text-foreground">{value}</Text>
			</View>
			<View className="flex-row gap-1">
				{LEVELS.map((step) => (
					<View
						key={step}
						className={`h-1 flex-1 rounded-xs ${step <= level ? "bg-primary" : "bg-primary-tint-strong"}`}
					/>
				))}
			</View>
		</View>
	);
}
