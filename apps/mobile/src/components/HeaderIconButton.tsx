import type { ComponentRef, Ref } from "react";
import type { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable, { type PressableProps } from "@/components/Pressable";
import { twMerge } from "@/utils/twMerge";

interface HeaderIconButtonProps extends PressableProps {
	ref?: Ref<ComponentRef<typeof View>>;
	icon: IoniconsIconName;
	// Ionicons glyphs fill their box unevenly, the size evens them out visually
	iconSize?: number;
	accessibilityLabel: string;
}

export function HeaderIconButton({
	icon,
	iconSize = 24,
	className,
	...props
}: HeaderIconButtonProps) {
	return (
		<Pressable
			accessibilityRole="button"
			pressedOpacity={0.5}
			hitSlop={8}
			pressedClassName="bg-white/10"
			className={twMerge(
				"size-10 items-center justify-center rounded-full",
				className,
			)}
			{...props}
		>
			<Ionicons name={icon} size={iconSize} className="text-foreground" />
		</Pressable>
	);
}
