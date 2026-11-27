import Pressable, { type PressableProps } from "@/components/Pressable";
import Text from "@/components/Text";
import { selectionFeedback } from "@/utils/haptics";
import { twMerge } from "@/utils/twMerge";

interface ChipProps extends PressableProps {
	label: string;
	selected: boolean;
}

export default function Chip({
	label,
	selected,
	className,
	onPress,
	...props
}: ChipProps) {
	return (
		<Pressable
			accessibilityRole="tab"
			accessibilityState={{ selected }}
			pressedOpacity={0.75}
			hitSlop={{ top: 4, bottom: 4 }}
			className={twMerge(
				"h-9 items-center justify-center rounded-xl px-4",
				selected ? "bg-primary" : "bg-primary-tint",
				className,
			)}
			{...props}
			onPress={(event) => {
				if (!selected) selectionFeedback();
				onPress?.(event);
			}}
		>
			<Text className={selected ? "text-on-primary" : "text-foreground"}>
				{label}
			</Text>
		</Pressable>
	);
}
