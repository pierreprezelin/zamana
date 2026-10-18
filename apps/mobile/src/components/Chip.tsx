import { twMerge } from "tailwind-merge";
import Pressable, { type PressableProps } from "@/components/Pressable";
import Text from "@/components/Text";

interface ChipProps extends PressableProps {
	label: string;
	selected: boolean;
}

export default function Chip({
	label,
	selected,
	className,
	...props
}: ChipProps) {
	return (
		<Pressable
			accessibilityRole="tab"
			accessibilityState={{ selected }}
			pressedClassName=""
			pressedOpacity={0.75}
			className={twMerge(
				"h-9 items-center justify-center rounded-[12px] px-4",
				selected ? "bg-primary" : "bg-primary-tint",
				className,
			)}
			{...props}
		>
			<Text className={selected ? "text-on-primary" : "text-foreground"}>
				{label}
			</Text>
		</Pressable>
	);
}
