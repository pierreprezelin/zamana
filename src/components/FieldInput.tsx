import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import {
	TextInput,
	type TextInputProps,
	useColorScheme,
	View,
} from "react-native";
import { twMerge } from "tailwind-merge";
import Text from "@/components/Text";
import palette from "@/constants/palette";

cssInterop(BottomSheetTextInput, { className: "style" });

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
	const scheme = useColorScheme() === "dark" ? "dark" : "light";
	const Input = inBottomSheet ? BottomSheetTextInput : TextInput;

	return (
		<View className="gap-1">
			<Input
				placeholderTextColor={palette.placeholder[scheme]}
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
