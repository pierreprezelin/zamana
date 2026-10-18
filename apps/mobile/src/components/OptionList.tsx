import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";

export type Option<T extends string> = { value: T; label: string };

type OptionListProps<T extends string> = {
	options: Option<T>[];
	selected: (T | null)[];
	onPress: (value: T) => void;
	multiple?: boolean;
};

export default function OptionList<T extends string>({
	options,
	selected,
	onPress,
	multiple = false,
}: OptionListProps<T>) {
	return (
		<View
			accessibilityRole={multiple ? undefined : "radiogroup"}
			// Aligns the labels with the sheet title despite the row padding
			className="-mx-3 gap-1"
		>
			{options.map((option) => {
				const checked = selected.includes(option.value);
				return (
					<Pressable
						key={option.value}
						accessibilityRole={multiple ? "checkbox" : "radio"}
						accessibilityState={{ checked }}
						pressedClassName=""
						pressedOpacity={0.5}
						onPress={() => onPress(option.value)}
						className={`h-11 flex-row items-center justify-between rounded-xl px-3 ${checked ? "bg-primary-tint" : ""}`}
					>
						<Text
							className={
								checked
									? "font-outfit-semibold text-foreground"
									: "text-foreground"
							}
						>
							{option.label}
						</Text>
						{checked && (
							<Ionicons name="checkmark" size={20} className="text-primary" />
						)}
					</Pressable>
				);
			})}
		</View>
	);
}
