import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useIsFocused, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";
import { careName, dueLabel } from "@/features/care/careLabels";
import {
	careProgress,
	careStatus,
	isDue,
	scheduleCares,
} from "@/features/care/careSchedule";
import type { Care } from "@/features/care/careTypes";
import { DueCareCard } from "@/features/care/components/DueCareCard";
import { ManageCaresSheet } from "@/features/care/components/ManageCaresSheet";
import { UpcomingCareRow } from "@/features/care/components/UpcomingCareRow";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { usePlantCares } from "@/features/care/useCareStore";
import { displayName } from "@/features/plants/plantLabels";
import { usePlant } from "@/features/plants/usePlantStore";
import { toISODate } from "@/utils/dates";
import { t } from "@/utils/i18n";

export default function PlantCareScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const plant = usePlant(id);
	const cares = usePlantCares(id);
	const climate = useCarePreferencesStore((state) => state.climate);
	const { bottom } = useSafeAreaInsets();
	const manageSheetRef = useRef<BottomSheetModal>(null);
	// Re-renders on focus, so a screen left open overnight catches up with the date
	useIsFocused();

	if (!plant) return null;

	const today = toISODate(new Date());
	const context = { wateringLevel: plant.watering, climate };
	const scheduled = scheduleCares(cares, context, today);
	const due = scheduled.filter(
		(entry): entry is { care: Care; dueDate: string } =>
			isDue(entry.dueDate, today),
	);
	const upcoming = scheduled.filter(({ dueDate }) => !isDue(dueDate, today));
	const next = upcoming.find(({ dueDate }) => dueDate);

	return (
		<ScrollView
			contentContainerClassName="gap-8 px-5 pt-3"
			contentContainerStyle={{ paddingBottom: bottom + 20 }}
		>
			<View className="gap-4">
				<Text className="font-recoleta text-2xl text-foreground">
					{t("care.todo")}
				</Text>
				{due.length ? (
					due.map(({ care, dueDate }) => (
						<DueCareCard
							key={care.id}
							care={care}
							plant={plant}
							dueDate={dueDate}
							status={careStatus(dueDate, today)}
							today={today}
						/>
					))
				) : (
					<View className="items-center gap-2 rounded-2xl border border-line bg-surface p-6">
						<View className="size-12 items-center justify-center rounded-full bg-primary-tint">
							<Ionicons
								name="checkmark-outline"
								size={24}
								className="text-primary"
							/>
						</View>
						<Text className="font-outfit-semibold text-base text-foreground">
							{t("care.upToDate.title")}
						</Text>
						<Text className="text-center text-muted">
							{t("care.upToDate.description", { name: displayName(plant) })}
							{next?.dueDate &&
								`\n${t("care.upToDate.next", {
									care: careName(next.care.type).toLocaleLowerCase(),
									due: dueLabel(next.dueDate, today).toLocaleLowerCase(),
								})}`}
						</Text>
					</View>
				)}
			</View>

			<View className="gap-4">
				<View className="flex-row items-center justify-between">
					<Text className="font-recoleta text-2xl text-foreground">
						{t("care.upcoming")}
					</Text>
					{!plant.archivedAt && (
						<Button
							variant="ghost"
							title={t("care.manage")}
							icon="options-outline"
							className="h-8 bg-primary-tint px-3"
							onPress={() => manageSheetRef.current?.present()}
						/>
					)}
				</View>
				<View className="gap-2">
					{upcoming.map(({ care, dueDate }) => (
						<UpcomingCareRow
							key={care.id}
							care={care}
							plant={plant}
							dueDate={dueDate}
							progress={careProgress(care, today, context)}
							today={today}
						/>
					))}
				</View>
			</View>
			<ManageCaresSheet ref={manageSheetRef} plant={plant} cares={cares} />
		</ScrollView>
	);
}
