import { View } from "react-native";
import Text from "@/components/Text";
import Toggle from "@/components/Toggle";

type ToggleRowProps = {
	label: string;
	helper?: string;
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
};

export default function ToggleRow({
	label,
	helper,
	value,
	onChange,
	disabled,
}: ToggleRowProps) {
	return (
		<View className="flex-row items-center gap-4">
			<View className="flex-1">
				<Text className="font-outfit-semibold text-foreground">{label}</Text>
				{helper && <Text className="text-xs text-muted">{helper}</Text>}
			</View>
			<Toggle
				accessibilityLabel={label}
				value={value}
				onChange={onChange}
				disabled={disabled}
			/>
		</View>
	);
}
