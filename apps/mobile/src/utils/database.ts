import { openDatabaseSync } from "expo-sqlite";
import { migrate } from "@/utils/migrations";

export const database = openDatabaseSync("zamana.db");

// The first version of the tables: later changes go to the migrations, so old databases follow
database.execSync(`
	PRAGMA foreign_keys = ON;
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
	CREATE TABLE IF NOT EXISTS care (
		id TEXT PRIMARY KEY,
		plant_id TEXT NOT NULL REFERENCES plant (id) ON DELETE CASCADE,
		type TEXT NOT NULL,
		frequency_amount INTEGER,
		frequency_unit TEXT,
		period_start_month INTEGER,
		period_end_month INTEGER,
		last_done_at TEXT,
		started_at TEXT NOT NULL,
		snoozed_until TEXT,
		reminder INTEGER NOT NULL DEFAULT 1,
		UNIQUE (plant_id, type)
	);
	CREATE TABLE IF NOT EXISTS care_log (
		id TEXT PRIMARY KEY,
		plant_id TEXT NOT NULL REFERENCES plant (id) ON DELETE CASCADE,
		type TEXT NOT NULL,
		outcome TEXT NOT NULL,
		date TEXT NOT NULL,
		created_at TEXT NOT NULL,
		previous_last_done_at TEXT,
		previous_snoozed_until TEXT
	);
	CREATE INDEX IF NOT EXISTS care_log_date ON care_log (date);
	CREATE INDEX IF NOT EXISTS care_log_plant ON care_log (plant_id);
	CREATE TABLE IF NOT EXISTS history_entry (
		id TEXT PRIMARY KEY,
		plant_id TEXT NOT NULL REFERENCES plant (id) ON DELETE CASCADE,
		photo TEXT,
		note TEXT,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);
	CREATE INDEX IF NOT EXISTS history_entry_plant ON history_entry (plant_id);
`);

migrate(database);
