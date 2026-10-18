import { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import { t } from "@/utils/i18n";

export type ViewMode = "list" | "grid";

const modes: { value: ViewMode; icon: IoniconsIconName; label: string }[] = [
	{ value: "list", icon: "list", label: t("garden.list") },
	{ value: "grid", icon: "grid-outline", label: t("garden.grid") },
];

type ViewModeToggleProps = {
	value: ViewMode;
	onChange: (value: ViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
	return (
		<View
			accessibilityRole="radiogroup"
			className="h-9 flex-row rounded-xl bg-primary-tint p-0.5"
		>
			{modes.map((mode) => {
				const selected = mode.value === value;
				return (
					<Pressable
						key={mode.value}
						accessibilityRole="radio"
						accessibilityLabel={mode.label}
						accessibilityState={{ checked: selected }}
						pressedClassName=""
						pressedOpacity={0.75}
						onPress={() => onChange(mode.value)}
						className={`size-8 items-center justify-center rounded-[10px] ${selected ? "bg-primary" : ""}`}
					>
						<Ionicons
							name={mode.icon}
							size={16}
							className={selected ? "text-on-primary" : "text-foreground"}
						/>
					</Pressable>
				);
			})}
		</View>
	);
}
