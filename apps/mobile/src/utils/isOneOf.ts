// Narrows an untrusted value, like a route param or saved data, to a known list
export const isOneOf = <T>(values: readonly T[], value: unknown): value is T =>
	(values as readonly unknown[]).includes(value);
