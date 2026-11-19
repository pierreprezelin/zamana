import Toast from "react-native-toast-message";
import { careName } from "@/features/care/careLabels";
import { snoozeUntil } from "@/features/care/careSchedule";
import type { Care, CareLog } from "@/features/care/careTypes";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import type { Plant } from "@/features/plants/plantSchema";
import { toISODate } from "@/utils/dates";
import { successFeedback } from "@/utils/haptics";
import { t } from "@/utils/i18n";
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

	return {
		done: async (care: Care) => {
			const succeeded = await run(() => markDone(care.id));
			if (succeeded) successFeedback();
			return succeeded;
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
			if (!(await run(() => undo(log.id)))) return;
			Toast.show({
				type: "success",
				text1: t("care.undone", { care: careName(log.type) }),
			});
		},
		setReminder: (care: Care, reminder: boolean) =>
			run(() => setReminder(care.id, reminder)),
	};
};
