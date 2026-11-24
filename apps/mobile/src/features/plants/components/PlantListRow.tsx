import { Link } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import { careName, dueLabel } from "@/features/care/careLabels";
import { careStatus, type NextCare } from "@/features/care/careSchedule";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { displayName } from "@/features/plants/plantLabels";
import { archiveReasonLabel } from "@/features/plants/plantOptions";
import type { Plant } from "@/features/plants/plantSchema";
import { lowerFirst, pluralForm, t } from "@/utils/i18n";

type PlantListRowProps = {
	plant: Plant;
	nextCare?: NextCare | null;
	today: string;
};

function NextCareLine({ next, today }: { next: NextCare; today: string }) {
	const { icon, text } = careAppearance[next.care.type];
	const late = careStatus(next.dueDate, today).kind === "late";
	return (
		<View className="mt-0.5 flex-row items-center gap-1">
			<Ionicons name={icon} size={14} className={text} />
			<Text
				numberOfLines={1}
				className={twMerge(
					"shrink text-xs",
					late ? "text-danger" : "text-muted",
				)}
			>
				{`${careName(next.care.type)} · ${lowerFirst(dueLabel(next.dueDate, today))}`}
			</Text>
			{next.otherDueCount > 0 && (
				<Text
					className="text-xs text-muted"
					accessibilityLabel={t(
						`care.otherDue.${pluralForm(next.otherDueCount)}`,
						{ amount: next.otherDueCount },
					)}
				>
					{`+${next.otherDueCount}`}
				</Text>
			)}
		</View>
	);
}

export const PlantListRow = memo(function PlantListRow({
	plant,
	nextCare,
	today,
}: PlantListRowProps) {
	return (
		<Link href={`/plant/${plant.id}`} asChild>
			<Pressable
				accessibilityRole="button"
				pressedClassName=""
				pressedOpacity={0.75}
				className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4"
			>
				<PlantPhoto photo={plant.photo} className="size-16 rounded-2xl" />
				<View className="flex-1">
					<Text
						numberOfLines={1}
						className="font-recoleta text-xl text-foreground"
					>
						{displayName(plant)}
					</Text>
					{plant.scientificName && (
						<Text numberOfLines={1} className="text-sm text-muted">
							{plant.scientificName}
						</Text>
					)}
					{nextCare && <NextCareLine next={nextCare} today={today} />}
					{plant.archiveReason && (
						<Text numberOfLines={1} className="text-xs text-muted">
							{archiveReasonLabel(plant.archiveReason)}
						</Text>
					)}
				</View>
			</Pressable>
		</Link>
	);
});
