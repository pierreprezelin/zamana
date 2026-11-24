import { Storage } from "expo-sqlite/kv-store";

const { TIPS } =
	require("@/features/tips/tips") as typeof import("@/features/tips/tips");
const { useTipStore, visibleTip } =
	require("@/features/tips/useTipStore") as typeof import("@/features/tips/useTipStore");

const state = () => useTipStore.getState();
const allIds = TIPS.map((tip) => tip.id);
const firstId = allIds[0] ?? "";

describe("useTipStore", () => {
	beforeEach(() =>
		useTipStore.setState({
			enabled: true,
			seenIds: [],
			todayTip: null,
			dismissedOn: null,
		}),
	);

	it("keeps the same tip for the day and picks a new one the next day", () => {
		state().pickTodayTip("2026-11-21", "north");
		const first = state().todayTip;
		state().pickTodayTip("2026-11-21", "north");

		expect(state().todayTip).toEqual(first);
		expect(state().seenIds).toEqual([first?.id]);

		state().pickTodayTip("2026-11-22", "north");
		expect(state().todayTip?.date).toBe("2026-11-22");
		expect(state().todayTip?.id).not.toBe(first?.id);
		expect(state().seenIds).toHaveLength(2);
	});

	it("shows no tip once all are seen, until they are reset", () => {
		useTipStore.setState({
			seenIds: allIds,
			todayTip: { id: firstId, date: "2026-11-20" },
		});
		state().pickTodayTip("2026-11-21", "north");
		expect(state().todayTip?.date).toBe("2026-11-20");

		state().reset();
		state().pickTodayTip("2026-11-21", "north");
		expect(state().todayTip?.date).toBe("2026-11-21");
	});

	it("shows today's tip only", () => {
		useTipStore.setState({ todayTip: { id: firstId, date: "2026-11-21" } });

		expect(visibleTip(state(), "2026-11-21")?.id).toBe(firstId);
		expect(visibleTip(state(), "2026-11-22")).toBeNull();
	});

	it("hides the card when disabled", () => {
		useTipStore.setState({
			enabled: false,
			todayTip: { id: firstId, date: "2026-11-21" },
		});

		expect(visibleTip(state(), "2026-11-21")).toBeNull();
	});

	it("hides the card until the next day once closed", () => {
		state().pickTodayTip("2026-11-21", "north");
		state().dismiss("2026-11-21");
		expect(visibleTip(state(), "2026-11-21")).toBeNull();

		state().pickTodayTip("2026-11-22", "north");
		expect(visibleTip(state(), "2026-11-22")).not.toBeNull();
	});

	it("restores sane values from an unreadable save", () => {
		Storage.setItemSync(
			"tips",
			JSON.stringify({
				state: {
					enabled: "false",
					seenIds: ["fingerTest", 42],
					todayTip: { id: "gone", date: "2026-11-21" },
				},
				version: 0,
			}),
		);

		useTipStore.persist.rehydrate();

		expect(state()).toMatchObject({
			enabled: true,
			seenIds: ["fingerTest"],
			todayTip: null,
		});
	});

	it("resets the history", () => {
		state().pickTodayTip("2026-11-21", "north");
		state().dismiss("2026-11-21");
		state().reset();

		expect(state()).toMatchObject({
			seenIds: [],
			todayTip: null,
			dismissedOn: null,
		});
	});
});
