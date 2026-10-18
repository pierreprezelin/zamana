import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";

type FieldButtonProps = {
	value: string | null;
	placeholder: string;
	icon: IoniconsIconName;
	onPress: () => void;
	onClear?: () => void;
	error?: string;
	disabled?: boolean;
	accessibilityLabel: string;
};

// Looks like a FieldInput but opens a picker, used by the select and date fields
export default function FieldButton({
	value,
	placeholder,
	icon,
	onPress,
	onClear,
	error,
	disabled,
	accessibilityLabel,
}: FieldButtonProps) {
	return (
		<View className="gap-1">
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityValue={{ text: value ?? placeholder }}
				pressedClassName=""
				pressedOpacity={0.75}
				disabled={disabled}
				onPress={onPress}
				className={twMerge(
					"h-12 flex-row items-center gap-3 rounded-xl border bg-surface px-4",
					error ? "border-danger" : "border-border",
					disabled && "border-line bg-line",
				)}
			>
				<Text
					numberOfLines={1}
					className={twMerge(
						"flex-1",
						value ? "text-foreground" : "text-placeholder",
					)}
				>
					{value ?? placeholder}
				</Text>
				{value && onClear && !disabled && (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Effacer ${accessibilityLabel}`}
						pressedClassName=""
						pressedOpacity={0.5}
						hitSlop={12}
						onPress={onClear}
					>
						<Ionicons name="close-circle" size={18} className="text-muted" />
					</Pressable>
				)}
				<Ionicons
					name={icon}
					size={16}
					className={disabled ? "text-placeholder" : "text-foreground"}
				/>
			</Pressable>
			{error && <Text className="text-xs text-danger">{error}</Text>}
		</View>
	);
}
