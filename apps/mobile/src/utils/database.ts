import { openDatabaseSync } from "expo-sqlite";

export const database = openDatabaseSync("zamana.db");

// ponytail: CREATE IF NOT EXISTS only, add versioned migrations once a table changes
database.execSync(`
	CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		name TEXT
	);
	CREATE TABLE IF NOT EXISTS plant (
		id TEXT PRIMARY KEY,
		photo TEXT,
		nickname TEXT,
		name TEXT NOT NULL,
		type TEXT,
		scientific_name TEXT,
		origin TEXT,
		acquired_at TEXT,
		location TEXT,
		born_at TEXT,
		light INTEGER NOT NULL DEFAULT 2,
		watering INTEGER NOT NULL DEFAULT 2,
		temperature INTEGER NOT NULL DEFAULT 2,
		humidity INTEGER NOT NULL DEFAULT 2,
		outdoor INTEGER NOT NULL DEFAULT 0,
		toxic INTEGER NOT NULL DEFAULT 0,
		flowering_seasons TEXT NOT NULL DEFAULT '[]',
		flowering_type TEXT,
		lifespan TEXT,
		notes TEXT,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		archived_at TEXT,
		archive_reason TEXT
	);
`);
