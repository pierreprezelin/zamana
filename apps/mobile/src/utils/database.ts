import { openDatabaseSync } from "expo-sqlite";

export const database = openDatabaseSync("zamana.db");

// ponytail: CREATE IF NOT EXISTS only, add versioned migrations once a table changes
database.execSync(`
	CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		name TEXT
	);
`);
