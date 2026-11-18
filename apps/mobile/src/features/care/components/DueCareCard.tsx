import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { careAppearance } from "@/features/care/careAppearance";
import {
	careName,
	careSubtitle,
	careVerb,
	dueLabel,
} from "@/features/care/careLabels";
import type { CareStatus } from "@/features/care/careSchedule";
import type { Care } from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import { useCareActions } from "@/features/care/useCareActions";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";

type DueCareCardProps = {
	care: Care;
	plant: Plant;
	dueDate: string;
	status: CareStatus;
	today: string;
};

export function DueCareCard({
	care,
	plant,
	dueDate,
	status,
	today,
}: DueCareCardProps) {
	const appearance = careAppearance[care.type];
	const { done, skip } = useCareActions();

	return (
		<View className={twMerge("gap-3 rounded-2xl p-4", appearance.tint)}>
			<View className="flex-row items-center gap-3">
				<CareBadge type={care.type} size={48} onTint />
				<View className="flex-1 gap-0.5">
					<View className="flex-row flex-wrap items-center gap-2">
						<Text className="font-outfit-semibold text-base text-foreground">
							{careName(care.type)}
						</Text>
						{status.kind === "late" && (
							// iOS does not round a Text background, hence the View
							<View className="rounded-full bg-danger px-2 py-0.5">
								<Text className="font-outfit-semibold text-xs text-on-danger">
									{dueLabel(dueDate, today)}
								</Text>
							</View>
						)}
					</View>
					<Text className="text-xs text-muted">
						{careSubtitle(care, plant.watering, new Date())}
					</Text>
				</View>
			</View>
			{!plant.archivedAt && (
				<View className="flex-row gap-2">
					<Button
						variant="ghost"
						title={t("care.skip")}
						icon="hourglass-outline"
						className="h-9 flex-1 bg-surface px-3"
						textClassName={appearance.text}
						onPress={() => skip(care, plant)}
					/>
					<Button
						title={careVerb(care.type)}
						icon="checkmark-outline"
						className={twMerge("h-9 flex-1 px-3", appearance.background)}
						textClassName="text-surface"
						onPress={() => done(care)}
					/>
				</View>
			)}
		</View>
	);
}
