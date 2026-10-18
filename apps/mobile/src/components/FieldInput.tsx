import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { TextInput, type TextInputProps, View } from "react-native";
import { twMerge } from "tailwind-merge";
import { withUniwind } from "uniwind";
import Text from "@/components/Text";

const StyledBottomSheetTextInput = withUniwind(BottomSheetTextInput);

interface FieldInputProps extends TextInputProps {
	error?: string;
	// The bottom sheet needs its own input to move above the keyboard
	inBottomSheet?: boolean;
}

export default function FieldInput({
	error,
	inBottomSheet = false,
	className,
	...props
}: FieldInputProps) {
	const Input = inBottomSheet ? StyledBottomSheetTextInput : TextInput;

	return (
		<View className="gap-1">
			<Input
				placeholderTextColorClassName="accent-placeholder"
				className={twMerge(
					"h-[46px] rounded-[12px] border bg-surface px-4 font-outfit text-[14px] text-moss",
					error ? "border-danger" : "border-border",
					className,
				)}
				{...props}
			/>
			{error && <Text className="text-[12px] text-danger">{error}</Text>}
		</View>
	);
}
