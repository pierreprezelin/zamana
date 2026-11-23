import type { SQLiteDatabase } from "expo-sqlite";

// Appended only, never edited: a database runs the ones after its user_version, in order
export const MIGRATIONS = ["ALTER TABLE plant ADD COLUMN photo_credit TEXT"];

type MigratableDatabase = Pick<
	SQLiteDatabase,
	"getFirstSync" | "execSync" | "withTransactionSync"
>;

export const migrate = (database: MigratableDatabase) => {
	const version =
		database.getFirstSync<{ user_version: number }>("PRAGMA user_version")
			?.user_version ?? 0;
	MIGRATIONS.slice(version).forEach((sql, index) => {
		database.withTransactionSync(() => {
			database.execSync(sql);
			database.execSync(`PRAGMA user_version = ${version + index + 1}`);
		});
	});
};
