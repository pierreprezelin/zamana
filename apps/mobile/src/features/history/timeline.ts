import { daysBetween } from "@/features/care/careSchedule";
import type { CareLog } from "@/features/care/careTypes";
import type { HistoryEntry } from "@/features/history/historyTypes";
import { compareISO, toISODate } from "@/utils/dates";

export type TimelineItem =
	| { kind: "entry"; id: string; entry: HistoryEntry }
	| { kind: "care"; id: string; log: CareLog }
	| { kind: "added"; id: "added"; createdAt: string };

export type TimelineSummary = {
	entries: number;
	photos: number;
	cares: number;
	days: number;
};

type TimelineInput = {
	addedAt: string;
	entries: HistoryEntry[];
	logs: CareLog[];
	showCares: boolean;
	today: string;
};

export const buildTimeline = ({
	addedAt,
	entries,
	logs,
	showCares,
	today,
}: TimelineInput) => {
	const dated = [
		...entries.map((entry) => ({
			createdAt: entry.createdAt,
			item: { kind: "entry", id: entry.id, entry } as const,
		})),
		...(showCares ? logs : []).map((log) => ({
			createdAt: log.createdAt,
			item: { kind: "care", id: log.id, log } as const,
		})),
	].sort((a, b) => compareISO(b.createdAt, a.createdAt));

	const items: TimelineItem[] = [
		...dated.map(({ item }) => item),
		{ kind: "added", id: "added", createdAt: addedAt },
	];
	const summary: TimelineSummary = {
		entries: entries.length,
		photos: entries.filter((entry) => entry.photo).length,
		cares: logs.filter((log) => log.outcome === "done").length,
		days: daysBetween(toISODate(new Date(addedAt)), today),
	};
	return { items, summary };
};
