import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useIsFocused, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/Button";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import Text from "@/components/Text";
import Toggle from "@/components/Toggle";
import { undoableLogIds } from "@/features/care/careHistory";
import { careActionLabel } from "@/features/care/careLabels";
import type { CareLog } from "@/features/care/careTypes";
import { useCareActions } from "@/features/care/useCareActions";
import { usePlantCares } from "@/features/care/useCareStore";
import { TimelineRow } from "@/features/history/components/TimelineRow";
import {
	buildTimeline,
	type TimelineItem,
	type TimelineSummary,
} from "@/features/history/timeline";
import { usePlantEntries } from "@/features/history/useHistoryStore";
import { usePlantCareLogs } from "@/features/history/usePlantCareLogs";
import { usePlant } from "@/features/plants/usePlantStore";
import { toISODate } from "@/utils/dates";
import { pluralForm, t } from "@/utils/i18n";

const summaryLabel = (summary: TimelineSummary) =>
	(["entries", "photos", "cares", "days"] as const)
		.map((key) =>
			t(`history.summary.${key}.${pluralForm(summary[key])}`, {
				amount: summary[key],
			}),
		)
		.join(" · ");

export default function PlantHistoryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const plant = usePlant(id);
	const entries = usePlantEntries(id);
	const logs = usePlantCareLogs(id);
	const cares = usePlantCares(id);
	const { undo } = useCareActions();
	const { bottom } = useSafeAreaInsets();
	const [showCares, setShowCares] = useState(true);
	const [undoneLog, setUndoneLog] = useState<CareLog | null>(null);
	const undoSheetRef = useRef<BottomSheetModal>(null);
	// Re-renders on focus, so a screen left open overnight catches up with the date
	useIsFocused();
	const today = toISODate(new Date());
	const addedAt = plant?.createdAt;
	const timeline = useMemo(
		() =>
			addedAt &&
			buildTimeline({
				addedAt,
				entries,
				logs: logs ?? [],
				showCares,
				today,
			}),
		[addedAt, entries, logs, showCares, today],
	);

	if (!plant || !timeline) return null;

	const { items, summary } = timeline;
	const readOnly = Boolean(plant.archivedAt);
	const undoable =
		readOnly || !logs ? new Set<string>() : undoableLogIds(logs, cares);

	const actionOf = (item: TimelineItem) => {
		if (readOnly) return undefined;
		if (item.kind === "entry") {
			return {
				icon: "pencil-outline",
				label: t("history.editEntry"),
				onPress: () =>
					router.push(`/plant/${id}/history-entry?entryId=${item.entry.id}`),
			} as const;
		}
		if (item.kind === "care" && undoable.has(item.log.id)) {
			const { log } = item;
			return {
				icon: "trash-outline",
				label: t("history.undoCare", { label: careActionLabel(log) }),
				danger: true,
				onPress: () => {
					setUndoneLog(log);
					undoSheetRef.current?.present();
				},
			} as const;
		}
		return undefined;
	};

	return (
		<View className="flex-1">
			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				contentContainerClassName="px-4 pt-3"
				contentContainerStyle={{ paddingBottom: readOnly ? bottom + 16 : 16 }}
				ListHeaderComponent={
					<View className="mb-6 flex-row items-center justify-between gap-4">
						<Text className="flex-1 font-outfit-semibold text-foreground">
							{logs && summaryLabel(summary)}
						</Text>
						<View className="flex-row items-center gap-2">
							<Text className="text-muted">{t("history.showCares")}</Text>
							<Toggle
								value={showCares}
								onChange={setShowCares}
								accessibilityLabel={t("history.showCares")}
							/>
						</View>
					</View>
				}
				renderItem={({ item, index }) => (
					<TimelineRow
						item={item}
						isLast={index === items.length - 1}
						action={actionOf(item)}
					/>
				)}
			/>
			{!readOnly && (
				<View
					className="bg-background px-4 pt-2.5"
					style={{ paddingBottom: bottom }}
				>
					<Button
						title={t("history.add")}
						icon="add-outline"
						onPress={() => router.push(`/plant/${id}/history-entry`)}
					/>
				</View>
			)}
			<ConfirmSheet
				ref={undoSheetRef}
				title={t("history.undoCareSheet.title", {
					label: undoneLog ? careActionLabel(undoneLog) : "",
				})}
				description={t("history.undoCareSheet.description")}
				confirmLabel={t("history.undoCareSheet.confirm")}
				onConfirm={() => {
					undoSheetRef.current?.dismiss();
					if (undoneLog) undo(undoneLog);
				}}
			/>
		</View>
	);
}
