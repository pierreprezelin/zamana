import type { TextProps } from "react-native";
import Text from "@/components/Text";
import { twMerge } from "@/utils/twMerge";

export default function FieldLabel({ className, ...props }: TextProps) {
	return (
		<Text
			className={twMerge(
				"font-outfit-semibold text-foreground mb-2",
				className,
			)}
			{...props}
		/>
	);
}
