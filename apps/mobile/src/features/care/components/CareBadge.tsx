import { View } from "react-native";
import { Ionicons } from "@/components/ionicons";
import { careAppearance } from "@/features/care/careAppearance";
import type { CareType } from "@/features/care/careTypes";
import { twMerge } from "@/utils/twMerge";

// The badge matches the height of the buttons on its row
const SIZES = {
	32: { className: "size-8", icon: 16 },
	36: { className: "size-9", icon: 18 },
	48: { className: "size-12", icon: 24 },
};

type CareBadgeProps = {
	type: CareType;
	size: keyof typeof SIZES;
	// On a tinted card, the badge stands out on the surface color
	onTint?: boolean;
	muted?: boolean;
};

export function CareBadge({
	type,
	size,
	onTint = false,
	muted = false,
}: CareBadgeProps) {
	const appearance = careAppearance[type];

	return (
		<View
			className={twMerge(
				"items-center justify-center rounded-xl",
				SIZES[size].className,
				onTint ? "bg-surface" : muted ? "" : appearance.tint,
			)}
		>
			<Ionicons
				name={appearance.icon}
				size={SIZES[size].icon}
				className={muted ? "text-muted" : appearance.text}
			/>
		</View>
	);
}
