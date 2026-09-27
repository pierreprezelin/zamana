import { forwardRef } from "react";
import type { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
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
	icon?: IoniconsIconName;
}

const Button = forwardRef<View, ButtonProps>(
	(
		{ title, variant = "primary", className, textClassName, icon, ...props },
		ref,
	) => {
		const styles = variants[variant];

		return (
			<Pressable
				ref={ref}
				pressedClassName={styles.pressedClassName}
				pressedOpacity={styles.pressedOpacity}
				className={twMerge(
					"h-[48px] flex-row items-center justify-center gap-2 rounded-[12px] px-8",
					styles.className,
					className,
				)}
				{...props}
			>
				{icon && (
					<Ionicons
						name={icon}
						size={18}
						className={twMerge(styles.textClassName, textClassName)}
					/>
				)}
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
