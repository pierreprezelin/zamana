import type { Ref } from "react";
import { Text as RNText, type TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

export default function Text({
	className,
	...props
}: TextProps & { ref?: Ref<RNText> }) {
	return (
		<RNText
			className={twMerge("font-outfit leading-[1.5] text-[14px]", className)}
			{...props}
		/>
	);
}
