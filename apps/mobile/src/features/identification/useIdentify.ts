import { useState } from "react";
import {
	identify,
	PlantNetError,
	type Suggestion,
} from "@/features/identification/plantnet";
import { usePlantNetStore } from "@/features/identification/usePlantNetStore";
import { deleteFile, shrinkPhoto } from "@/features/plants/plantPhoto";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

// Null when the identification failed, the user being told why
export const identifyPhoto = async (
	photoUri: string,
	apiKey: string,
): Promise<Suggestion[] | null> => {
	const { updateRemaining } = usePlantNetStore.getState();
	try {
		const shrunk = await shrinkPhoto(photoUri);
		try {
			const { suggestions, remaining } = await identify(shrunk, apiKey);
			if (remaining !== null) updateRemaining(remaining, new Date());
			return suggestions;
		} finally {
			deleteFile(shrunk);
		}
	} catch (error) {
		const kind = error instanceof PlantNetError ? error.kind : "unknown";
		if (kind === "quotaExceeded") updateRemaining(0, new Date());
		showErrorToast(t(`identification.errors.${kind}`));
		return null;
	}
};

export const useIdentify = () => {
	const apiKey = usePlantNetStore((state) => state.apiKey);
	const [identifying, setIdentifying] = useState(false);

	const run = async (photoUri: string) => {
		if (!apiKey) return null;
		setIdentifying(true);
		try {
			return await identifyPhoto(photoUri, apiKey);
		} finally {
			setIdentifying(false);
		}
	};

	return { enabled: apiKey !== null, identifying, identify: run };
};
