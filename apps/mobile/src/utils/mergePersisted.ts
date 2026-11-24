import type { z } from "zod";

type Schemas<T> = { [K in keyof T]?: z.ZodType<T[K]> };

// Saved data can come from an older version or a corrupted storage: each field
// is restored only if readable, the others keep their current value
export const mergePersisted =
	<T extends object>(schemas: Schemas<T>) =>
	(persisted: unknown, current: T): T => {
		const saved =
			typeof persisted === "object" && persisted !== null
				? (persisted as Record<string, unknown>)
				: {};
		const merged = { ...current };
		for (const key of Object.keys(schemas) as (keyof T & string)[]) {
			const result = schemas[key]?.safeParse(saved[key]);
			if (result?.success) merged[key] = result.data;
		}
		return merged;
	};
