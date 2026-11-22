import { useEffect } from "react";
import type { Climate } from "@/features/care/careTypes";
import { useTipStore, visibleTip } from "@/features/tips/useTipStore";

export function useTodayTip(today: string, climate: Climate) {
	const enabled = useTipStore((state) => state.enabled);
	const todayTip = useTipStore((state) => state.todayTip);
	const dismissedOn = useTipStore((state) => state.dismissedOn);
	const pickTodayTip = useTipStore((state) => state.pickTodayTip);

	// Also runs after a reset from the settings, which clears today's tip
	useEffect(() => {
		if (enabled && todayTip?.date !== today) pickTodayTip(today, climate);
	}, [enabled, todayTip, today, climate, pickTodayTip]);

	return visibleTip({ enabled, todayTip, dismissedOn }, today);
}
