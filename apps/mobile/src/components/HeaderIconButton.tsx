import type { ComponentRef, Ref } from "react";
import type { View } from "react-native";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable, { type PressableProps } from "@/components/Pressable";

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
	...props
}: HeaderIconButtonProps) {
	return (
		<Pressable
			accessibilityRole="button"
			pressedOpacity={0.5}
			hitSlop={8}
			className="size-10 items-center justify-center rounded-full"
			{...props}
		>
			<Ionicons name={icon} size={iconSize} className="text-foreground" />
		</Pressable>
	);
}
