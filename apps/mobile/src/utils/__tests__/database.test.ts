import type { PlantData } from "@/features/plants/plantSchema";
import { MIGRATIONS } from "@/utils/migrations";

type SqliteParam = string | number | boolean | null | undefined;
// The part of node:sqlite used here, the app types leaving Node out
type NodeDatabase = {
	exec: (sql: string) => void;
	prepare: (sql: string) => {
		run: (...params: unknown[]) => unknown;
		get: (...params: unknown[]) => unknown;
		all: (...params: unknown[]) => unknown[];
	};
};

let mockSqlite: NodeDatabase;
let mockUuid = 0;

jest.mock("expo-crypto", () => ({ randomUUID: () => `id-${++mockUuid}` }));

jest.mock("@/features/plants/plantPhoto", () => ({ deletePhoto: jest.fn() }));

// The real SQLite of Node behind the expo-sqlite calls the app makes: the
// schema, its constraints and the migrations run as they do on the phone
jest.mock("expo-sqlite", () => {
	const toSqlite = (params: SqliteParam[]) =>
		params.map((param) =>
			typeof param === "boolean" ? Number(param) : (param ?? null),
		);
	const transaction = async (task: () => Promise<void> | void) => {
		mockSqlite.exec("BEGIN");
		try {
			await task();
			mockSqlite.exec("COMMIT");
		} catch (error) {
			mockSqlite.exec("ROLLBACK");
			throw error;
		}
	};
	return {
		openDatabaseSync: () => ({
			execSync: (sql: string) => mockSqlite.exec(sql),
			getFirstSync: (sql: string, ...params: SqliteParam[]) =>
				mockSqlite.prepare(sql).get(...toSqlite(params)) ?? null,
			getAllSync: (sql: string, ...params: SqliteParam[]) =>
				mockSqlite.prepare(sql).all(...toSqlite(params)),
			getAllAsync: async (sql: string, ...params: SqliteParam[]) =>
				mockSqlite.prepare(sql).all(...toSqlite(params)),
			runAsync: async (sql: string, ...params: SqliteParam[]) =>
				mockSqlite.prepare(sql).run(...toSqlite(params)),
			withTransactionAsync: transaction,
			withTransactionSync: (task: () => void) => {
				mockSqlite.exec("BEGIN");
				try {
					task();
					mockSqlite.exec("COMMIT");
				} catch (error) {
					mockSqlite.exec("ROLLBACK");
					throw error;
				}
			},
		}),
	};
});

beforeEach(() => {
	const { DatabaseSync } = require("node:sqlite") as {
		DatabaseSync: new (path: string) => NodeDatabase;
	};
	mockSqlite = new DatabaseSync(":memory:");
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
		await cares.getState().markDone(watering?.id ?? "");
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

describe("the schema", () => {
	const plantRow = (id: string) =>
		mockSqlite
			.prepare(
				"INSERT INTO plant (id, name, created_at, updated_at) VALUES (?, 'Pilea', '2026-01-01', '2026-01-01')",
			)
			.run(id);
	const careRow = (id: string, plantId: string) =>
		mockSqlite
			.prepare(
				"INSERT INTO care (id, plant_id, type, started_at) VALUES (?, ?, 'watering', '2026-01-01')",
			)
			.run(id, plantId);

	it("runs every migration once, on a new database and on each launch", () => {
		launch();
		launch();

		const { user_version } = mockSqlite
			.prepare("PRAGMA user_version")
			.get() as { user_version: number };
		expect(user_version).toBe(MIGRATIONS.length);
	});

	it("keeps a single care of each type per plant", () => {
		launch();
		plantRow("pilea");
		careRow("care-1", "pilea");

		expect(() => careRow("care-2", "pilea")).toThrow(/UNIQUE/);
	});

	it("deletes the cares, logs and entries of a deleted plant", () => {
		launch();
		plantRow("pilea");
		careRow("care-1", "pilea");
		mockSqlite
			.prepare(
				"INSERT INTO history_entry (id, plant_id, created_at, updated_at) VALUES ('entry-1', 'pilea', '2026-01-01', '2026-01-01')",
			)
			.run();

		mockSqlite.prepare("DELETE FROM plant WHERE id = 'pilea'").run();

		for (const table of ["care", "history_entry"]) {
			expect(
				mockSqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get(),
			).toEqual(expect.objectContaining({ count: 0 }));
		}
	});
});
