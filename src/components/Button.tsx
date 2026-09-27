import { forwardRef } from "react";
import type { View } from "react-native";
import { twMerge } from "tailwind-merge";
import Pressable, { type PressableProps } from "@/components/Pressable";
import Text from "@/components/Text";

const variants = {
	primary: {
		className: "bg-forest",
		pressedClassName: "bg-white/10",
		pressedOpacity: 1,
		textClassName: "text-white",
	},
	ghost: {
		className: "",
		pressedClassName: "",
		pressedOpacity: 0.9,
		textClassName: "text-moss",
	},
};

interface ButtonProps extends PressableProps {
	title: string;
	variant?: keyof typeof variants;
	textClassName?: string;
}

const Button = forwardRef<View, ButtonProps>(
	({ title, variant = "primary", className, textClassName, ...props }, ref) => {
		const styles = variants[variant];

		return (
			<Pressable
				ref={ref}
				pressedClassName={styles.pressedClassName}
				pressedOpacity={styles.pressedOpacity}
				className={twMerge(
					"h-[48px] items-center justify-center rounded-[12px] px-8",
					styles.className,
					className,
				)}
				{...props}
			>
				<Text
					className={twMerge(
						"text-center font-outfit-semibold",
						styles.textClassName,
						textClassName,
					)}
				>
					{title}
				</Text>
			</Pressable>
		);
	},
);

export default Button;
