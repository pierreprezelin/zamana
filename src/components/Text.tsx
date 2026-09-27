import { forwardRef } from "react";
import {
	Text as RNText,
	type Text as RNTextRef,
	type TextProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

const Text = forwardRef<RNTextRef, TextProps>(
	({ className, ...props }, ref) => (
		<RNText
			ref={ref}
			className={twMerge("font-outfit leading-[1.5] text-[14px]", className)}
			{...props}
		/>
	),
);

export default Text;
