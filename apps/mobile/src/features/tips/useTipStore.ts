import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Climate } from "@/features/care/careTypes";
import { currentSeason, pickTip, TIPS } from "@/features/tips/tips";
import { parseISODate } from "@/utils/dates";
import { syncStorage } from "@/utils/syncStorage";

type TipState = {
	enabled: boolean;
	seenIds: string[];
	todayTip: { id: string; date: string } | null;
	dismissedOn: string | null;
	pickTodayTip: (today: string, climate: Climate) => void;
	dismiss: (today: string) => void;
	setEnabled: (enabled: boolean) => void;
	reset: () => void;
};

const isInCatalog = (id: string) => TIPS.some((tip) => tip.id === id);

type TipVisibility = Pick<TipState, "enabled" | "todayTip" | "dismissedOn">;

export const visibleTip = (
	{ enabled, todayTip, dismissedOn }: TipVisibility,
	today: string,
) =>
	enabled && todayTip?.date === today && dismissedOn !== today
		? (TIPS.find((tip) => tip.id === todayTip.id) ?? null)
		: null;

export const useTipStore = create<TipState>()(
	persist(
		(set, get) => ({
			enabled: true,
			seenIds: [],
			todayTip: null,
			dismissedOn: null,
			pickTodayTip: (today, climate) => {
				const { todayTip, seenIds } = get();
				if (todayTip?.date === today) return;
				const tip = pickTip({
					tips: TIPS,
					seenIds,
					season: currentSeason(parseISODate(today).getMonth() + 1, climate),
					random: Math.random,
				});
				if (!tip) return;
				set({
					todayTip: { id: tip.id, date: today },
					seenIds: [...seenIds, tip.id],
				});
			},
			dismiss: (today) => set({ dismissedOn: today }),
			setEnabled: (enabled) => set({ enabled }),
			reset: () => set({ seenIds: [], todayTip: null, dismissedOn: null }),
		}),
		{
			name: "tips",
			storage: syncStorage,
			// An unreadable history would crash the home screen on every launch
			merge: (persisted, current) => {
				const saved = persisted as Partial<TipState>;
				return {
					...current,
					...saved,
					enabled:
						typeof saved?.enabled === "boolean"
							? saved.enabled
							: current.enabled,
					seenIds: Array.isArray(saved?.seenIds)
						? saved.seenIds.filter((id) => typeof id === "string")
						: current.seenIds,
					// An update may remove today's tip from the catalog
					todayTip:
						saved?.todayTip && isInCatalog(saved.todayTip.id)
							? saved.todayTip
							: null,
				};
			},
		},
	),
);
