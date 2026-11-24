import { ActivityIndicator } from "react-native";
import { twMerge } from "tailwind-merge";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable, { type PressableProps } from "@/components/Pressable";
import Text from "@/components/Text";

const variants = {
	primary: {
		className: "bg-primary",
		pressedClassName: "bg-white/10",
		pressedOpacity: 1,
		textClassName: "text-on-primary",
		indicatorClassName: "accent-on-primary",
	},
	ghost: {
		className: "",
		pressedClassName: "",
		pressedOpacity: 0.9,
		textClassName: "text-foreground",
		indicatorClassName: "accent-foreground",
	},
	outline: {
		className: "rounded-2xl border border-line bg-surface",
		pressedClassName: "",
		pressedOpacity: 0.75,
		textClassName: "text-foreground",
		indicatorClassName: "accent-foreground",
	},
	ghostDanger: {
		className: "",
		pressedClassName: "",
		pressedOpacity: 0.9,
		textClassName: "text-danger",
		indicatorClassName: "accent-danger",
	},
	danger: {
		className: "bg-danger",
		pressedClassName: "bg-white/10",
		pressedOpacity: 1,
		textClassName: "text-on-danger",
		indicatorClassName: "accent-on-danger",
	},
	warning: {
		className: "bg-warning",
		pressedClassName: "bg-white/10",
		pressedOpacity: 1,
		textClassName: "text-on-warning",
		indicatorClassName: "accent-on-warning",
	},
};

const sizes = {
	default: { className: "h-12", hitSlop: undefined },
	small: { className: "h-9", hitSlop: { top: 4, bottom: 4 } },
};

interface ButtonProps extends PressableProps {
	title: string;
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
	textClassName?: string;
	icon?: IoniconsIconName;
	loading?: boolean;
}

export default function Button({
	title,
	variant = "primary",
	size = "default",
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
			hitSlop={sizes[size].hitSlop}
			className={twMerge(
				"flex-row items-center justify-center gap-2 rounded-xl px-8",
				sizes[size].className,
				styles.className,
				className,
			)}
			disabled={disabled || loading}
			accessibilityLabel={title}
			accessibilityState={{ busy: loading }}
			{...props}
		>
			{loading ? (
				<ActivityIndicator colorClassName={styles.indicatorClassName} />
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
