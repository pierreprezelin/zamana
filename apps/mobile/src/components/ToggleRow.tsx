import { View } from "react-native";
import Text from "@/components/Text";
import Toggle from "@/components/Toggle";

type ToggleRowProps = {
	label: string;
	helper?: string;
	value: boolean;
	onChange: (value: boolean) => void;
};

export default function ToggleRow({
	label,
	helper,
	value,
	onChange,
}: ToggleRowProps) {
	return (
		<View className="flex-row items-center gap-4">
			<View className="flex-1">
				<Text className="font-outfit-semibold text-foreground">{label}</Text>
				{helper && <Text className="text-xs text-muted">{helper}</Text>}
			</View>
			<Toggle accessibilityLabel={label} value={value} onChange={onChange} />
		</View>
	);
}
