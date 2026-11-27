import { z } from "zod";
import type { Quota } from "@/features/identification/quota";
import { fetchWithTimeout } from "@/utils/getJson";
import { locale } from "@/utils/i18n";

export const PLANTNET_URL = "https://plantnet.org/";
const API_URL = "https://my-api.plantnet.org/v2";
const MAX_SUGGESTIONS = 3;
// A photo upload on a weak mobile network takes longer than a JSON request
const IDENTIFY_TIMEOUT_MS = 20_000;

export type PlantNetErrorKind =
	| "invalidKey"
	| "notFound"
	| "quotaExceeded"
	| "offline"
	| "unknown";

export class PlantNetError extends Error {
	constructor(readonly kind: PlantNetErrorKind) {
		super(`Pl@ntNet: ${kind}`);
	}
}

export type Suggestion = {
	scientificName: string;
	commonName: string | null;
	score: number;
};

const text = z.string().max(500);

const identifySchema = z.object({
	results: z
		.array(
			z.object({
				score: z.number().min(0).max(1),
				species: z.object({
					scientificNameWithoutAuthor: text.min(1),
					commonNames: z.array(text).max(100).default([]),
				}),
			}),
		)
		.max(100),
	remainingIdentificationRequests: z.number().int().min(0).optional(),
});

const count = z.number().int().min(0);

const dailyQuotaSchema = z.object({
	day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	quota: z.object({
		identify: z.object({ count, total: count, remaining: count }),
	}),
});

const errorKind = (status: number): PlantNetErrorKind => {
	if (status === 401 || status === 403) return "invalidKey";
	if (status === 404) return "notFound";
	if (status === 429) return "quotaExceeded";
	return "unknown";
};

const request = async <T>(
	path: string,
	apiKey: string,
	schema: z.ZodType<T>,
	{
		params = {},
		init,
		timeoutMs,
	}: {
		params?: Record<string, string>;
		init?: RequestInit;
		timeoutMs?: number;
	} = {},
) => {
	const query = new URLSearchParams({ "api-key": apiKey, ...params });
	let response: Response;
	try {
		response = await fetchWithTimeout(
			`${API_URL}${path}?${query}`,
			init,
			timeoutMs,
		);
	} catch (error) {
		// The cause, like a TLS failure, is otherwise lost behind "offline". Logged without the URL and its key
		if (__DEV__) console.warn("Pl@ntNet request failed", error);
		throw new PlantNetError("offline");
	}
	if (!response.ok) throw new PlantNetError(errorKind(response.status));

	const parsed = schema.safeParse(await response.json().catch(() => null));
	if (!parsed.success) throw new PlantNetError("unknown");
	return parsed.data;
};

// An expo-file-system File: Expo's fetch reads its bytes, and refuses React Native's { uri } parts
export const identify = async (photo: Blob, apiKey: string) => {
	const body = new FormData();
	body.append("images", photo);
	body.append("organs", "auto");

	const { results, remainingIdentificationRequests } = await request(
		"/identify/all",
		apiKey,
		identifySchema,
		{
			params: { lang: locale(), "nb-results": String(MAX_SUGGESTIONS) },
			init: { method: "POST", body },
			timeoutMs: IDENTIFY_TIMEOUT_MS,
		},
	);
	if (results.length === 0) throw new PlantNetError("notFound");

	return {
		suggestions: results.slice(0, MAX_SUGGESTIONS).map(
			({ score, species }): Suggestion => ({
				scientificName: species.scientificNameWithoutAuthor,
				commonName: species.commonNames[0] ?? null,
				score,
			}),
		),
		remaining: remainingIdentificationRequests ?? null,
	};
};

export const fetchDailyQuota = async (apiKey: string): Promise<Quota> => {
	const { day, quota } = await request(
		"/quota/daily",
		apiKey,
		dailyQuotaSchema,
	);
	return { day, ...quota.identify };
};
