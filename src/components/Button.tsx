import { ActivityIndicator } from "react-native";
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
	loading?: boolean;
}

export default function Button({
	title,
	variant = "primary",
	className,
	textClassName,
	icon,
	loading = false,
	disabled,
	...props
}: ButtonProps) {
	const styles = variants[variant];
	const contentClassName = twMerge(styles.textClassName, textClassName);

	return (
		<Pressable
			pressedClassName={styles.pressedClassName}
			pressedOpacity={styles.pressedOpacity}
			className={twMerge(
				"h-[48px] flex-row items-center justify-center gap-2 rounded-[12px] px-8",
				styles.className,
				className,
			)}
			disabled={disabled || loading}
			accessibilityLabel={title}
			accessibilityState={{ busy: loading }}
			{...props}
		>
			{loading ? (
				<ActivityIndicator className={contentClassName} />
			) : (
				<>
					{icon && (
						<Ionicons name={icon} size={18} className={contentClassName} />
					)}
					<Text
						className={twMerge(
							"text-center font-outfit-semibold",
							contentClassName,
						)}
					>
						{title}
					</Text>
				</>
			)}
		</Pressable>
	);
}
