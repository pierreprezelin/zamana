import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";

export type InfoRow = {
	label: string;
	value: string | null;
	onInfoPress?: () => void;
};

type InfoCardProps = {
	title: string;
	rows: InfoRow[];
};

// Rows without a value are hidden, and the whole card when none is left
export function InfoCard({ title, rows }: InfoCardProps) {
	const filledRows = rows.filter((row) => row.value);
	if (filledRows.length === 0) return null;

	return (
		<View className="gap-3">
			<Text className="font-recoleta text-xl text-foreground">{title}</Text>
			<View className="rounded-2xl border border-line bg-surface px-4">
				{filledRows.map((row, index) => (
					<View
						key={row.label}
						className={`flex-row items-center justify-between gap-4 py-3.5 ${index < filledRows.length - 1 ? "border-b border-primary-tint" : ""}`}
					>
						<Text className="text-muted">{row.label}</Text>
						<View className="flex-1 flex-row items-center justify-end gap-1.5">
							<Text className="shrink text-right font-outfit-semibold text-foreground">
								{row.value}
							</Text>
							{row.onInfoPress && (
								<Pressable
									accessibilityRole="button"
									accessibilityLabel={`En savoir plus : ${row.label}`}
									pressedClassName=""
									pressedOpacity={0.5}
									hitSlop={12}
									onPress={row.onInfoPress}
								>
									<Ionicons
										name="information-circle-outline"
										size={18}
										className="text-foreground"
									/>
								</Pressable>
							)}
						</View>
					</View>
				))}
			</View>
		</View>
	);
}
