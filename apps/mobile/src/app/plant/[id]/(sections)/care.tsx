import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useIsFocused, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import StatusCard from "@/components/StatusCard";
import Text from "@/components/Text";
import { careName, dueLabel } from "@/features/care/careLabels";
import {
	careProgress,
	careStatus,
	wasDueWhenDone,
} from "@/features/care/careSchedule";
import type { CareType } from "@/features/care/careTypes";
import { CareFormSheet } from "@/features/care/components/CareFormSheet";
import {
	DueCareCard,
	HandledCareCard,
} from "@/features/care/components/DueCareCard";
import { ManageCaresSheet } from "@/features/care/components/ManageCaresSheet";
import { UpcomingCareRow } from "@/features/care/components/UpcomingCareRow";
import { plantCareSections } from "@/features/care/plantCareSections";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore, usePlantCares } from "@/features/care/useCareStore";
import { displayName } from "@/features/plants/plantLabels";
import { usePlant } from "@/features/plants/usePlantStore";
import { toISODate } from "@/utils/dates";
import { t } from "@/utils/i18n";

export default function PlantCareScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const plant = usePlant(id);
	const cares = usePlantCares(id);
	const climate = useCarePreferencesStore((state) => state.climate);
	const logs = useCareStore((state) => state.logs);
	const { bottom } = useSafeAreaInsets();
	const manageSheetRef = useRef<BottomSheetModal>(null);
	const formSheetRef = useRef<BottomSheetModal>(null);
	const [editedType, setEditedType] = useState<CareType | null>(null);
	// Re-renders on focus, so a screen left open overnight catches up with the date
	useIsFocused();

	if (!plant) return null;

	const today = toISODate(new Date());
	const context = { wateringLevel: plant.watering, climate };
	const { due, handledToday, upcoming, next } = plantCareSections({
		cares,
		logs,
		context,
		today,
	});

	const manageSheet = (
		<>
			<ManageCaresSheet
				ref={manageSheetRef}
				plant={plant}
				cares={cares}
				onEdit={(type) => {
					setEditedType(type);
					formSheetRef.current?.present();
				}}
			/>
			<CareFormSheet
				ref={formSheetRef}
				plant={plant}
				type={editedType}
				care={cares.find((care) => care.type === editedType)}
			/>
		</>
	);

	// Both layouts share the sheets: one unmounted while closing would stop the next ones from opening
	return (
		<>
			{cares.length ? (
				<ScrollView
					contentContainerClassName="gap-6 px-4 pt-3"
					contentContainerStyle={{ paddingBottom: bottom + 16 }}
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
							<StatusCard
								icon="checkmark-outline"
								title={t(
									handledToday.some(
										({ care, handledLog }) =>
											handledLog.outcome === "done" &&
											wasDueWhenDone(care, handledLog, context, today),
									)
										? "care.tasks.allDone"
										: "care.upToDate.title",
								)}
								description={[
									t("care.upToDate.description", { name: displayName(plant) }),
									next?.dueDate &&
										t("care.upToDate.next", {
											care: careName(next.care.type).toLocaleLowerCase(),
											due: dueLabel(next.dueDate, today).toLocaleLowerCase(),
										}),
								]
									.filter(Boolean)
									.join("\n")}
							/>
						)}
						{handledToday.map(({ care, handledLog, dueDate }) => (
							<HandledCareCard
								key={care.id}
								care={care}
								handledLog={handledLog}
								plant={plant}
								dueDate={dueDate}
								today={today}
							/>
						))}
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
									// Same discreet link as "Voir tout" next to the garden title
									className="h-8 px-0"
									textClassName="text-muted"
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
				</ScrollView>
			) : (
				<View className="px-4 pt-3">
					<StatusCard
						icon="clipboard-outline"
						title={t("care.noCare.title", { name: displayName(plant) })}
						description={t("care.noCare.description")}
					>
						{!plant.archivedAt && (
							<Button
								title={t("care.noCare.configure")}
								className="mt-2 h-9 px-4"
								onPress={() => manageSheetRef.current?.present()}
							/>
						)}
					</StatusCard>
				</View>
			)}
			{manageSheet}
		</>
	);
}
