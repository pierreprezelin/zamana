import type { ReactNode } from "react";
import { View } from "react-native";
import FieldInput from "@/components/FieldInput";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import { t } from "@/utils/i18n";

// Caps queries sent to a third-party API, like a long text pasted by mistake
export const REMOTE_SEARCH_MAX_LENGTH = 100;

type SearchFieldProps = {
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
	maxLength?: number;
	searchIconReplacement?: ReactNode;
};

export default function SearchField({
	value,
	onChangeText,
	placeholder,
	maxLength,
	searchIconReplacement,
}: SearchFieldProps) {
	return (
		<View className="justify-center">
			<FieldInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				maxLength={maxLength}
				accessibilityLabel={placeholder}
				autoCorrect={false}
				returnKeyType="search"
				className="pr-12"
			/>
			<View className="absolute right-4">
				{value ? (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={t("common.clearSearch")}
						pressedOpacity={0.5}
						hitSlop={13}
						onPress={() => onChangeText("")}
					>
						<Ionicons
							name="backspace-outline"
							size={18}
							className="text-foreground"
						/>
					</Pressable>
				) : (
					(searchIconReplacement ?? (
						<Ionicons
							name="search-outline"
							size={18}
							className="text-foreground"
						/>
					))
				)}
			</View>
		</View>
	);
}
