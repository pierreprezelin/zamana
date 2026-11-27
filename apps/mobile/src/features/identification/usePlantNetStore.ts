import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiKeySchema } from "@/features/identification/apiKey";
import {
	FREE_DAILY_QUOTA,
	type Quota,
	utcDay,
} from "@/features/identification/quota";
import { mergePersisted } from "@/utils/mergePersisted";
import { syncStorage } from "@/utils/syncStorage";

const SECURE_KEY = "plantNetApiKey";
// Not restored from a backup onto another phone
const SECURE_OPTIONS = {
	keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// The keychain can fail, like after a backup restored on another phone: the user enters the key again
const readApiKey = () => {
	try {
		const parsed = apiKeySchema.safeParse(
			SecureStore.getItem(SECURE_KEY, SECURE_OPTIONS),
		);
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
};

type PlantNetState = {
	apiKey: string | null;
	quota: Quota | null;
	// The former key stays when the new one is not saved
	setApiKey: (input: string) => "saved" | "invalid" | "failed";
	clearApiKey: () => Promise<void>;
	setQuota: (quota: Quota) => void;
	updateRemaining: (remaining: number, now: Date) => void;
};

const quotaSchema = z.object({
	day: z.string(),
	count: z.number(),
	total: z.number(),
	remaining: z.number(),
});

export const usePlantNetStore = create<PlantNetState>()(
	persist(
		(set, get) => ({
			apiKey: readApiKey(),
			quota: null,
			setApiKey: (input) => {
				const parsed = apiKeySchema.safeParse(input);
				if (!parsed.success) return "invalid";
				try {
					SecureStore.setItem(SECURE_KEY, parsed.data, SECURE_OPTIONS);
				} catch {
					return "failed";
				}
				set({ apiKey: parsed.data, quota: null });
				return "saved";
			},
			// Deleted first: a key still stored would come back at the next launch
			clearApiKey: async () => {
				await SecureStore.deleteItemAsync(SECURE_KEY, SECURE_OPTIONS);
				set({ apiKey: null, quota: null });
			},
			setQuota: (quota) => set({ quota }),
			updateRemaining: (remaining, now) => {
				const total = get().quota?.total ?? FREE_DAILY_QUOTA;
				set({
					quota: {
						day: utcDay(now),
						count: Math.max(0, total - remaining),
						total,
						remaining,
					},
				});
			},
		}),
		{
			name: "plantNet",
			storage: syncStorage,
			partialize: ({ quota }) => ({ quota }),
			merge: mergePersisted<PlantNetState>({
				quota: quotaSchema.nullable(),
			}),
		},
	),
);
