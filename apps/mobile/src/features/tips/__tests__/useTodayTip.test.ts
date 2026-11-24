import { act, renderHook } from "@testing-library/react-native";

const { TIPS } =
	require("@/features/tips/tips") as typeof import("@/features/tips/tips");
const { useTipStore } =
	require("@/features/tips/useTipStore") as typeof import("@/features/tips/useTipStore");
const { useTodayTip } =
	require("@/features/tips/useTodayTip") as typeof import("@/features/tips/useTodayTip");

const firstId = TIPS[0]?.id ?? "";

beforeEach(() =>
	useTipStore.setState({
		enabled: true,
		seenIds: [],
		todayTip: null,
		dismissedOn: null,
	}),
);

describe("useTodayTip", () => {
	it("picks and shows a tip for the day", async () => {
		const { result } = await renderHook(() =>
			useTodayTip("2026-11-21", "north"),
		);

		expect(useTipStore.getState().todayTip?.date).toBe("2026-11-21");
		expect(result.current?.id).toBe(useTipStore.getState().todayTip?.id);
	});

	it("keeps the tip already picked today", async () => {
		useTipStore.setState({ todayTip: { id: firstId, date: "2026-11-21" } });

		const { result } = await renderHook(() =>
			useTodayTip("2026-11-21", "north"),
		);

		expect(useTipStore.getState().todayTip?.id).toBe(firstId);
		expect(result.current?.id).toBe(firstId);
	});

	it("picks a new tip when the day changes, at midnight", async () => {
		let today = "2026-11-21";
		const { result, rerender } = await renderHook(() =>
			useTodayTip(today, "north"),
		);
		const yesterdayTip = result.current?.id;

		today = "2026-11-22";
		await rerender({});

		expect(useTipStore.getState().todayTip?.date).toBe("2026-11-22");
		expect(result.current?.id).not.toBe(yesterdayTip);
	});

	it("shows nothing and picks nothing when the tips are turned off", async () => {
		useTipStore.setState({ enabled: false });

		const { result } = await renderHook(() =>
			useTodayTip("2026-11-21", "north"),
		);

		expect(result.current).toBeNull();
		expect(useTipStore.getState().todayTip).toBeNull();
	});

	it("shows nothing once the tip is dismissed today, and again the next day", async () => {
		useTipStore.setState({
			todayTip: { id: firstId, date: "2026-11-21" },
			dismissedOn: "2026-11-21",
		});
		let today = "2026-11-21";
		const { result, rerender } = await renderHook(() =>
			useTodayTip(today, "north"),
		);
		expect(result.current).toBeNull();

		today = "2026-11-22";
		await rerender({});

		expect(result.current).not.toBeNull();
	});

	it("picks a tip again after a reset from the settings", async () => {
		const { result } = await renderHook(() =>
			useTodayTip("2026-11-21", "north"),
		);
		expect(result.current).not.toBeNull();

		await act(async () => useTipStore.getState().reset());

		expect(useTipStore.getState().todayTip?.date).toBe("2026-11-21");
	});
});
