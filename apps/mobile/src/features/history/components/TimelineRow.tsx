import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import { careActionLabel } from "@/features/care/careLabels";
import type { TimelineItem } from "@/features/history/timeline";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { formatDateTime } from "@/utils/dates";
import { t } from "@/utils/i18n";

type RowAction = {
	icon: IoniconsIconName;
	label: string;
	danger?: boolean;
	onPress: () => void;
};

type TimelineRowProps = {
	item: TimelineItem;
	isLast: boolean;
	action?: RowAction;
};

const markerOf = (item: TimelineItem) => {
	if (item.kind === "entry") {
		return {
			icon: item.entry.photo ? "image-outline" : "document-text-outline",
			className: "bg-primary-tint",
			iconClassName: "text-primary",
		} as const;
	}
	if (item.kind === "care") {
		const appearance = careAppearance[item.log.type];
		return {
			// The hourglass of the snooze button, so a skipped care stands out from a done one
			icon: item.log.outcome === "done" ? appearance.icon : "hourglass-outline",
			className: appearance.tint,
			iconClassName: appearance.text,
		};
	}
	return {
		icon: "add-outline",
		className: "bg-primary-tint",
		iconClassName: "text-primary",
	} as const;
};

const createdAtOf = (item: TimelineItem) => {
	if (item.kind === "entry") return item.entry.createdAt;
	if (item.kind === "care") return item.log.createdAt;
	return item.createdAt;
};

export function TimelineRow({ item, isLast, action }: TimelineRowProps) {
	const marker = markerOf(item);

	return (
		<View className="flex-row gap-4">
			{/* Centers the 32px marker on the 24px date line */}
			<View className="-mt-1 items-center">
				<View
					className={twMerge(
						"size-8 items-center justify-center rounded-full",
						marker.className,
					)}
				>
					<Ionicons
						name={marker.icon}
						size={16}
						className={marker.iconClassName}
					/>
				</View>
				{!isLast && (
					// A dotted border on one side only falls back to solid on iOS: the box is
					// clipped to its left border instead. The bottom margin makes up for the
					// next marker pulled 4px up, for the same 8px gap on both ends
					<View className="mt-2 mb-3 w-px flex-1 overflow-hidden">
						<View
							className="absolute left-0 w-2 border border-dotted border-muted"
							style={{ top: -1, bottom: -1 }}
						/>
					</View>
				)}
			</View>
			<View className={twMerge("flex-1 gap-1", !isLast && "pb-6")}>
				<View className="flex-row items-center justify-between gap-2">
					<Text className="flex-1 font-outfit-semibold leading-6 text-foreground">
						{formatDateTime(createdAtOf(item))}
					</Text>
					{action && (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={action.label}
							pressedClassName="bg-white/10"
							pressedOpacity={0.5}
							hitSlop={8}
							className="-my-1 -mr-2 size-8 items-center justify-center"
							onPress={action.onPress}
						>
							<Ionicons
								name={action.icon}
								size={20}
								className={action.danger ? "text-danger" : "text-foreground"}
							/>
						</Pressable>
					)}
				</View>
				{item.kind === "entry" && (
					<>
						{item.entry.photo && (
							<PlantPhoto
								photo={item.entry.photo}
								className="mt-1 aspect-3/2 w-full rounded-2xl"
							/>
						)}
						{item.entry.note && (
							<Text className="text-muted">{item.entry.note}</Text>
						)}
					</>
				)}
				{item.kind === "care" && (
					<Text className="text-muted">{careActionLabel(item.log)}</Text>
				)}
				{item.kind === "added" && (
					<Text className="text-muted">{t("history.added")}</Text>
				)}
			</View>
		</View>
	);
}
