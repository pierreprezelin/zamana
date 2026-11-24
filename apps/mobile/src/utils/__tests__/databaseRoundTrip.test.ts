import type { PlantData } from "@/features/plants/plantSchema";

type Row = Record<string, unknown>;

const mockTables: Record<string, Row[]> = {};
let mockUuid = 0;

jest.mock("expo-crypto", () => ({ randomUUID: () => `id-${++mockUuid}` }));

jest.mock("@/features/plants/plantPhoto", () => ({ deletePhoto: jest.fn() }));

// Stands in for SQLite by reading the column names in the SQL itself: a param
// out of order with its column comes back in the wrong field once reloaded
jest.mock("@/utils/database", () => {
	const rowsOf = (table: string) => {
		mockTables[table] ??= [];
		return mockTables[table];
	};
	// A column the INSERT leaves out is NULL in SQLite
	const withNulls = (row: Row) =>
		new Proxy(row, { get: (target, key: string) => target[key] ?? null });

	return {
		database: {
			getAllSync: (sql: string) =>
				rowsOf(/FROM (\w+)/.exec(sql)?.[1] ?? "").map(withNulls),
			runAsync: async (sql: string, ...params: unknown[]) => {
				const insert = /INSERT INTO (\w+) \(([^)]*)\)/.exec(sql);
				if (insert) {
					const columns = insert[2].split(",").map((column) => column.trim());
					rowsOf(insert[1]).push(
						Object.fromEntries(columns.map((column, i) => [column, params[i]])),
					);
					return { changes: 1 };
				}
				const update = /UPDATE (\w+) SET ([\s\S]*) WHERE id = \?/.exec(sql);
				if (update) {
					const row = rowsOf(update[1]).find((row) => row.id === params.at(-1));
					update[2].split(",").forEach((assignment, i) => {
						if (row) row[assignment.split("=")[0].trim()] = params[i];
					});
					return { changes: row ? 1 : 0 };
				}
				const remove = /DELETE FROM (\w+) WHERE id = \?$/.exec(sql);
				if (remove) {
					const rows = rowsOf(remove[1]);
					mockTables[remove[1]] = rows.filter((row) => row.id !== params[0]);
					return { changes: rows.length - mockTables[remove[1]].length };
				}
				throw new Error(`Unsupported SQL: ${sql}`);
			},
			withTransactionAsync: async (task: () => Promise<void>) => task(),
		},
	};
});

// A fresh launch: the stores read the saved rows again
const launch = () => {
	let stores = {} as {
		plants: typeof import("@/features/plants/usePlantStore").usePlantStore;
		cares: typeof import("@/features/care/useCareStore").useCareStore;
		history: typeof import("@/features/history/useHistoryStore").useHistoryStore;
	};
	jest.isolateModules(() => {
		stores = {
			plants: require("@/features/plants/usePlantStore").usePlantStore,
			cares: require("@/features/care/useCareStore").useCareStore,
			history: require("@/features/history/useHistoryStore").useHistoryStore,
		};
	});
	return stores;
};

// Every field differs from the others, so a swap of two columns shows
const data: PlantData = {
	photo: "photo.jpg",
	photoCredit: {
		attribution: "(c) Jane",
		url: "https://www.inaturalist.org/photos/1",
	},
	nickname: "Pili",
	name: "Pilea",
	type: "succulent",
	scientificName: "Pilea peperomioides",
	origin: "store",
	acquiredAt: "2026-03-01",
	location: "livingRoom",
	bornAt: "2025-05-01",
	light: 1,
	watering: 2,
	temperature: 3,
	humidity: 4,
	outdoor: true,
	toxic: false,
	floweringSeasons: ["spring", "summer"],
	floweringType: "polycarpic",
	lifespan: "perennial",
	notes: "By the window",
};

describe("the saved data", () => {
	it("comes back unchanged on the next launch", async () => {
		const { plants, cares, history } = launch();

		const plantId = await plants.getState().createPlant(data);
		await plants.getState().archivePlant(plantId, "given");
		const [watering] = cares.getState().cares;
		await cares.getState().markDone(watering.id);
		const pruning = await cares.getState().createCare(plantId, {
			type: "pruning",
			frequency: { amount: 3, unit: "month" },
			period: { startMonth: 4, endMonth: 9 },
			lastDoneAt: "2026-02-01",
			reminder: false,
		});
		await cares.getState().skipCare(pruning, "2099-01-01");
		const kept = await history
			.getState()
			.createEntry(plantId, { photo: null, note: "First leaf" });
		await history
			.getState()
			.updateEntry(kept, { photo: "leaf.jpg", note: "New leaf" });
		const removed = await history
			.getState()
			.createEntry(plantId, { photo: null, note: "Typo" });
		await history.getState().deleteEntry(removed);

		const relaunched = launch();

		expect(relaunched.plants.getState().plants).toEqual(
			plants.getState().plants,
		);
		expect(relaunched.cares.getState().cares).toEqual(cares.getState().cares);
		expect(relaunched.cares.getState().logs).toEqual(cares.getState().logs);
		expect(relaunched.history.getState().entries).toEqual(
			history.getState().entries,
		);
		expect(relaunched.history.getState().entries).toHaveLength(1);
		expect(relaunched.cares.getState().logs).toHaveLength(2);
	});
});
