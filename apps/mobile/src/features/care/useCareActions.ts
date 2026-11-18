import Toast from "react-native-toast-message";
import { snoozeUntil } from "@/features/care/careSchedule";
import type { Care } from "@/features/care/careTypes";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import type { Plant } from "@/features/plants/plantSchema";
import { toISODate } from "@/utils/dates";
import { t } from "@/utils/i18n";

const run = async (action: () => Promise<void>) => {
	try {
		await action();
	} catch {
		Toast.show({ type: "error", text1: t("care.actionFailed") });
	}
};

export const useCareActions = () => {
	const climate = useCarePreferencesStore((state) => state.climate);
	const { markDone, skipCare, undo, setReminder } = useCareStore.getState();

	return {
		done: (care: Care) => run(() => markDone(care.id)),
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
		undo: (logId: string) => run(() => undo(logId)),
		setReminder: (care: Care, reminder: boolean) =>
			run(() => setReminder(care.id, reminder)),
	};
};
