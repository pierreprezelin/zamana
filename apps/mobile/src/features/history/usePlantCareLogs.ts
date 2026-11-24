import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { CareLog } from "@/features/care/careTypes";
import {
	type CareLogRow,
	toCareLog,
	useCareStore,
} from "@/features/care/useCareStore";
import { database } from "@/utils/database";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

// Read on demand: unlike today's logs, the whole history keeps growing
export const usePlantCareLogs = (plantId: string) => {
	// Changes on every done, skip and undo of this plant
	const todayLogs = useCareStore(
		useShallow((state) => state.logs.filter((log) => log.plantId === plantId)),
	);
	// Null until read, so nothing reads as an empty history meanwhile
	const [logs, setLogs] = useState<CareLog[] | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: todayLogs is the reload signal
	useEffect(() => {
		let current = true;
		database
			.getAllAsync<CareLogRow>(
				"SELECT * FROM care_log WHERE plant_id = ?",
				plantId,
			)
			.then((rows) => {
				if (current) setLogs(rows.map(toCareLog));
			})
			.catch(() => showErrorToast(t("history.loadFailed")));
		return () => {
			current = false;
		};
	}, [plantId, todayLogs]);

	return logs;
};
