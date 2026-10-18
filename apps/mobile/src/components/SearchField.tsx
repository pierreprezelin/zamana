import { View } from "react-native";
import FieldInput from "@/components/FieldInput";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";

type SearchFieldProps = {
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
};

export default function SearchField({
	value,
	onChangeText,
	placeholder,
}: SearchFieldProps) {
	return (
		<View className="justify-center">
			<FieldInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				accessibilityLabel={placeholder}
				autoCorrect={false}
				returnKeyType="search"
				className="pr-12"
			/>
			<View className="absolute right-4">
				{value ? (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Effacer la recherche"
						pressedClassName=""
						pressedOpacity={0.5}
						hitSlop={12}
						onPress={() => onChangeText("")}
					>
						<Ionicons
							name="backspace-outline"
							size={18}
							className="text-foreground"
						/>
					</Pressable>
				) : (
					<Ionicons
						name="search-outline"
						size={18}
						className="text-foreground"
					/>
				)}
			</View>
		</View>
	);
}
