import type { TextProps } from "react-native";
import { twMerge } from "tailwind-merge";
import Text from "@/components/Text";

export default function FieldLabel({ className, ...props }: TextProps) {
	return (
		<Text
			className={twMerge("font-outfit-semibold text-moss mb-2", className)}
			{...props}
		/>
	);
}
