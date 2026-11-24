import { MIGRATIONS, migrate } from "@/utils/migrations";

const fakeDatabase = (version: number) => {
	const executed: string[] = [];
	return {
		executed,
		getFirstSync: () => ({ user_version: version }),
		execSync: (sql: string) => {
			executed.push(sql);
		},
		withTransactionSync: (task: () => void) => task(),
	};
};

describe("migrate", () => {
	it("brings a new or old database up to date, step by step", () => {
		const database = fakeDatabase(0);

		migrate(database);

		expect(database.executed).toEqual(
			MIGRATIONS.flatMap((sql, index) => [
				sql,
				`PRAGMA user_version = ${index + 1}`,
			]),
		);
	});

	it("leaves an up to date database alone", () => {
		const database = fakeDatabase(MIGRATIONS.length);

		migrate(database);

		expect(database.executed).toEqual([]);
	});
});
