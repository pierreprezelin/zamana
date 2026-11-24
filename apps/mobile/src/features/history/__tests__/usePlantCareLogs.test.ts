import { act, renderHook } from "@testing-library/react-native";
import type { CareLogRow } from "@/features/care/useCareStore";
import { showErrorToast } from "@/utils/toast";

const mockGetAllAsync = jest.fn<Promise<CareLogRow[]>, [string, string]>();

jest.mock("@/utils/database", () => ({
	database: {
		getAllSync: () => [],
		getAllAsync: (sql: string, plantId: string) =>
			mockGetAllAsync(sql, plantId),
	},
}));
jest.mock("@/utils/toast", () => ({ showErrorToast: jest.fn() }));

const { useCareStore } =
	require("@/features/care/useCareStore") as typeof import("@/features/care/useCareStore");
const { usePlantCareLogs } =
	require("@/features/history/usePlantCareLogs") as typeof import("@/features/history/usePlantCareLogs");

const row = (id: string): CareLogRow => ({
	id,
	plant_id: "pilea",
	type: "watering",
	outcome: "done",
	date: "2026-06-10",
	created_at: "2026-06-10T08:00:00.000Z",
	previous_last_done_at: null,
	previous_snoozed_until: null,
});

beforeEach(() => jest.clearAllMocks());

describe("usePlantCareLogs", () => {
	it("reads the whole care history of the plant", async () => {
		mockGetAllAsync.mockResolvedValue([row("log-1")]);

		const { result } = await renderHook(() => usePlantCareLogs("pilea"));

		expect(mockGetAllAsync).toHaveBeenCalledWith(expect.any(String), "pilea");
		expect(result.current.map((log) => log.id)).toEqual(["log-1"]);
	});

	it("reads it again once a care is done, skipped or undone", async () => {
		mockGetAllAsync.mockResolvedValueOnce([row("log-1")]);
		const { result } = await renderHook(() => usePlantCareLogs("pilea"));

		mockGetAllAsync.mockResolvedValueOnce([row("log-1"), row("log-2")]);
		await act(async () => useCareStore.setState({ logs: [] }));

		expect(result.current.map((log) => log.id)).toEqual(["log-1", "log-2"]);
	});

	it("tells the user when the history cannot be read", async () => {
		mockGetAllAsync.mockRejectedValue(new Error("locked"));

		await renderHook(() => usePlantCareLogs("pilea"));

		expect(showErrorToast).toHaveBeenCalledWith(
			"L’historique n’a pas pu être chargé",
		);
	});
});
