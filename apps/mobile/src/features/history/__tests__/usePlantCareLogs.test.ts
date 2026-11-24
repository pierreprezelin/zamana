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

const { toCareLog, useCareStore } =
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

beforeEach(() => {
	jest.clearAllMocks();
	useCareStore.setState({ logs: [] });
});

describe("usePlantCareLogs", () => {
	it("reads the whole care history of the plant", async () => {
		mockGetAllAsync.mockResolvedValue([row("log-1")]);

		const { result } = await renderHook(() => usePlantCareLogs("pilea"));

		expect(mockGetAllAsync).toHaveBeenCalledWith(expect.any(String), "pilea");
		expect(result.current?.map((log) => log.id)).toEqual(["log-1"]);
	});

	it("knows no history before it is read, rather than an empty one", async () => {
		mockGetAllAsync.mockReturnValue(new Promise(() => {}));

		const { result } = await renderHook(() => usePlantCareLogs("pilea"));

		expect(result.current).toBeNull();
	});

	it("reads it again once a care is done, skipped or undone", async () => {
		mockGetAllAsync.mockResolvedValueOnce([row("log-1")]);
		const { result } = await renderHook(() => usePlantCareLogs("pilea"));

		mockGetAllAsync.mockResolvedValueOnce([row("log-1"), row("log-2")]);
		await act(async () =>
			useCareStore.setState({ logs: [toCareLog(row("log-2"))] }),
		);

		expect(result.current?.map((log) => log.id)).toEqual(["log-1", "log-2"]);
	});

	it("leaves it alone when the care of another plant is done", async () => {
		mockGetAllAsync.mockResolvedValue([row("log-1")]);
		await renderHook(() => usePlantCareLogs("pilea"));

		await act(async () =>
			useCareStore.setState({
				logs: [{ ...toCareLog(row("log-3")), plantId: "ficus" }],
			}),
		);

		expect(mockGetAllAsync).toHaveBeenCalledTimes(1);
	});

	it("tells the user when the history cannot be read", async () => {
		mockGetAllAsync.mockRejectedValue(new Error("locked"));

		await renderHook(() => usePlantCareLogs("pilea"));

		expect(showErrorToast).toHaveBeenCalledWith(
			"L’historique n’a pas pu être chargé",
		);
	});
});
