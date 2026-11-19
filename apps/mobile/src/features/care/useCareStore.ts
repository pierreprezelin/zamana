import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import type { CareInput } from "@/features/care/careSchema";
import type {
	Care,
	CareLog,
	CareOutcome,
	CareType,
	FrequencyUnit,
} from "@/features/care/careTypes";
import { database } from "@/utils/database";
import { toISODate } from "@/utils/dates";

type CareRow = {
	id: string;
	plant_id: string;
	type: CareType;
	frequency_amount: number | null;
	frequency_unit: FrequencyUnit | null;
	period_start_month: number | null;
	period_end_month: number | null;
	last_done_at: string | null;
	started_at: string;
	snoozed_until: string | null;
	reminder: number;
};

export type CareLogRow = {
	id: string;
	plant_id: string;
	type: CareType;
	outcome: CareOutcome;
	date: string;
	created_at: string;
	previous_last_done_at: string | null;
	previous_snoozed_until: string | null;
};

const toCare = (row: CareRow): Care => ({
	id: row.id,
	plantId: row.plant_id,
	type: row.type,
	frequency:
		row.frequency_amount && row.frequency_unit
			? { amount: row.frequency_amount, unit: row.frequency_unit }
			: null,
	period:
		row.period_start_month && row.period_end_month
			? { startMonth: row.period_start_month, endMonth: row.period_end_month }
			: null,
	lastDoneAt: row.last_done_at,
	startedAt: row.started_at,
	snoozedUntil: row.snoozed_until,
	reminder: Boolean(row.reminder),
});

export const toCareLog = (row: CareLogRow): CareLog => ({
	id: row.id,
	plantId: row.plant_id,
	type: row.type,
	outcome: row.outcome,
	date: row.date,
	createdAt: row.created_at,
	previousLastDoneAt: row.previous_last_done_at,
	previousSnoozedUntil: row.previous_snoozed_until,
});

// Same order as the columns of insertCare and updateCare
const settingsParams = ({
	frequency,
	period,
	lastDoneAt,
	reminder,
}: CareInput) => [
	frequency?.amount ?? null,
	frequency?.unit ?? null,
	period?.startMonth ?? null,
	period?.endMonth ?? null,
	lastDoneAt,
	Number(reminder),
];

const today = () => toISODate(new Date());

type CareState = {
	cares: Care[];
	// Only today's, to show what was done and allow undoing it
	logs: CareLog[];
	trackWatering: (plantId: string) => Promise<string>;
	createCare: (plantId: string, input: CareInput) => Promise<string>;
	updateCare: (id: string, input: CareInput) => Promise<void>;
	setReminder: (id: string, reminder: boolean) => Promise<void>;
	markDone: (id: string) => Promise<void>;
	skipCare: (id: string, snoozedUntil: string) => Promise<void>;
	undo: (log: CareLog) => Promise<void>;
	stopCare: (id: string) => Promise<void>;
	forgetPlant: (plantId: string) => void;
};

// Sync reads so the screens have the cares on the first render
const savedCares = database
	.getAllSync<CareRow>("SELECT * FROM care")
	.map(toCare);
const savedLogs = database
	.getAllSync<CareLogRow>(
		"SELECT * FROM care_log WHERE date = ? ORDER BY created_at",
		today(),
	)
	.map(toCareLog);

const withPatch = (cares: Care[], id: string, patch: Partial<Care>) =>
	cares.map((care) => (care.id === id ? { ...care, ...patch } : care));

// Guards against a double tap, or a tap during a swipe, logging a care twice
const busyCares = new Set<string>();

export const useCareStore = create<CareState>()((set, get) => {
	const findCare = (id: string) => get().cares.find((care) => care.id === id);

	const patchCare = (id: string, patch: Partial<Care>) =>
		set(({ cares }) => ({ cares: withPatch(cares, id, patch) }));

	const insertCare = async (care: Care) => {
		await database.runAsync(
			`INSERT INTO care (id, plant_id, type, frequency_amount, frequency_unit, period_start_month, period_end_month, last_done_at, reminder, started_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			care.id,
			care.plantId,
			care.type,
			...settingsParams(care),
			care.startedAt,
		);
		set(({ cares }) => ({ cares: [...cares, care] }));
		return care.id;
	};

	const updateProgress = (
		id: string,
		lastDoneAt: string | null,
		snoozedUntil: string | null,
	) =>
		database.runAsync(
			"UPDATE care SET last_done_at = ?, snoozed_until = ? WHERE id = ?",
			lastDoneAt,
			snoozedUntil,
			id,
		);

	// The log and the care move together, or not at all
	const logAndUpdate = async (
		id: string,
		outcome: CareOutcome,
		progress: (care: Care) => Pick<Care, "lastDoneAt" | "snoozedUntil">,
	) => {
		const care = findCare(id);
		if (!care || busyCares.has(id)) return;
		// A care is done once a day, a second one would outlive an undo
		const doneToday = get().logs.some(
			(log) =>
				log.outcome === "done" &&
				log.date === today() &&
				log.plantId === care.plantId &&
				log.type === care.type,
		);
		if (outcome === "done" && doneToday) return;
		busyCares.add(id);
		try {
			const entry: CareLog = {
				id: randomUUID(),
				plantId: care.plantId,
				type: care.type,
				outcome,
				date: today(),
				createdAt: new Date().toISOString(),
				previousLastDoneAt: care.lastDoneAt,
				previousSnoozedUntil: care.snoozedUntil,
			};
			const { lastDoneAt, snoozedUntil } = progress(care);
			await database.withTransactionAsync(async () => {
				await database.runAsync(
					`INSERT INTO care_log (id, plant_id, type, outcome, date, created_at, previous_last_done_at, previous_snoozed_until)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					entry.id,
					entry.plantId,
					entry.type,
					entry.outcome,
					entry.date,
					entry.createdAt,
					entry.previousLastDoneAt,
					entry.previousSnoozedUntil,
				);
				await updateProgress(id, lastDoneAt, snoozedUntil);
			});
			set(({ cares, logs }) => ({
				cares: withPatch(cares, id, { lastDoneAt, snoozedUntil }),
				logs: [...logs, entry],
			}));
		} finally {
			busyCares.delete(id);
		}
	};

	return {
		cares: savedCares,
		logs: savedLogs,
		trackWatering: (plantId) =>
			insertCare({
				id: randomUUID(),
				plantId,
				type: "watering",
				frequency: null,
				period: null,
				lastDoneAt: null,
				startedAt: today(),
				snoozedUntil: null,
				reminder: true,
			}),
		createCare: (plantId, input) =>
			insertCare({
				id: randomUUID(),
				plantId,
				...input,
				startedAt: today(),
				snoozedUntil: null,
			}),
		updateCare: async (id, input) => {
			await database.runAsync(
				`UPDATE care SET frequency_amount = ?, frequency_unit = ?, period_start_month = ?, period_end_month = ?, last_done_at = ?, reminder = ?
				WHERE id = ?`,
				...settingsParams(input),
				id,
			);
			const { type, ...settings } = input;
			patchCare(id, settings);
		},
		setReminder: async (id, reminder) => {
			await database.runAsync(
				"UPDATE care SET reminder = ? WHERE id = ?",
				Number(reminder),
				id,
			);
			patchCare(id, { reminder });
		},
		markDone: (id) =>
			logAndUpdate(id, "done", () => ({
				lastDoneAt: today(),
				snoozedUntil: null,
			})),
		skipCare: (id, snoozedUntil) =>
			logAndUpdate(id, "skipped", (care) => ({
				lastDoneAt: care.lastDoneAt,
				snoozedUntil,
			})),
		// Only for a log of undoableLogIds, so the care found is the one it was logged on
		undo: async (entry) => {
			const care = get().cares.find(
				(care) => care.plantId === entry.plantId && care.type === entry.type,
			);
			let deleted = false;
			await database.withTransactionAsync(async () => {
				const { changes } = await database.runAsync(
					"DELETE FROM care_log WHERE id = ?",
					entry.id,
				);
				// A stale log, undone twice, would roll back whatever came after it
				deleted = changes > 0;
				if (deleted && care) {
					await updateProgress(
						care.id,
						entry.previousLastDoneAt,
						entry.previousSnoozedUntil,
					);
				}
			});
			if (!deleted) return;
			set(({ cares, logs }) => ({
				cares: care
					? withPatch(cares, care.id, {
							lastDoneAt: entry.previousLastDoneAt,
							snoozedUntil: entry.previousSnoozedUntil,
						})
					: cares,
				logs: logs.filter((log) => log.id !== entry.id),
			}));
		},
		stopCare: async (id) => {
			const care = findCare(id);
			if (!care) return;
			await database.withTransactionAsync(async () => {
				await database.runAsync("DELETE FROM care WHERE id = ?", id);
				await database.runAsync(
					"DELETE FROM care_log WHERE plant_id = ? AND type = ? AND date = ?",
					care.plantId,
					care.type,
					today(),
				);
			});
			set(({ cares, logs }) => ({
				cares: cares.filter((tracked) => tracked.id !== id),
				logs: logs.filter(
					(log) => log.plantId !== care.plantId || log.type !== care.type,
				),
			}));
		},
		// The database cascades the plant deletion, only the memory is left
		forgetPlant: (plantId) =>
			set(({ cares, logs }) => ({
				cares: cares.filter((care) => care.plantId !== plantId),
				logs: logs.filter((log) => log.plantId !== plantId),
			})),
	};
});

export const usePlantCares = (plantId: string) =>
	useCareStore((state) => state.cares).filter(
		(care) => care.plantId === plantId,
	);
