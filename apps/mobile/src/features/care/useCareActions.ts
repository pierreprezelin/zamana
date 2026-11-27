import Toast from "react-native-toast-message";
import { careName, dueLabel } from "@/features/care/careLabels";
import { nextDueDate, snoozeUntil } from "@/features/care/careSchedule";
import type { Care, CareLog } from "@/features/care/careTypes";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import type { Plant } from "@/features/plants/plantSchema";
import { toISODate } from "@/utils/dates";
import { successFeedback } from "@/utils/haptics";
import { lowerFirst, t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

// Resolves to whether the action went through, so a success can be confirmed
const run = async (action: () => Promise<void>) => {
	try {
		await action();
		return true;
	} catch {
		showErrorToast(t("care.actionFailed"));
		return false;
	}
};

export const useCareActions = () => {
	const climate = useCarePreferencesStore((state) => state.climate);
	const { markDone, skipCare, undo, setReminder } = useCareStore.getState();

	const done = async (care: Care) => {
		const succeeded = await run(() => markDone(care.id));
		if (succeeded) successFeedback();
		return succeeded;
	};

	return {
		done,
		// Done ahead of time, the row barely changes: say it was noted
		doneEarly: async (care: Care, plant: Plant, today: string) => {
			if (!(await done(care))) return;
			const name = careName(care.type);
			const next = nextDueDate(
				{ ...care, lastDoneAt: today, snoozedUntil: null },
				{ wateringLevel: plant.watering, climate },
				today,
			);
			Toast.show({
				type: "success",
				text1: next
					? t("care.doneEarly", {
							care: name,
							due: lowerFirst(dueLabel(next, today)),
						})
					: t("care.doneNoted", { care: name }),
			});
		},
		skip: (care: Care, plant: Plant) =>
			run(() =>
				skipCare(
					care.id,
					snoozeUntil(care, toISODate(new Date()), {
						wateringLevel: plant.watering,
						climate,
					}),
				),
			),
		undo: async (log: CareLog) => {
			if (!(await run(() => undo(log)))) return;
			Toast.show({
				type: "success",
				text1: t("care.undone", { care: careName(log.type) }),
			});
		},
		setReminder: (care: Care, reminder: boolean) =>
			run(() => setReminder(care.id, reminder)),
	};
};
