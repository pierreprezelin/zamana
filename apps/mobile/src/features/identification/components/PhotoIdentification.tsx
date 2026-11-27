import { useState } from "react";
import Button from "@/components/Button";
import { IdentificationSuggestions } from "@/features/identification/components/IdentificationSuggestions";
import type { Suggestion } from "@/features/identification/plantnet";
import { useIdentifiedPhotoStore } from "@/features/identification/useIdentifiedPhotoStore";
import { useIdentify } from "@/features/identification/useIdentify";
import { isRemotePhoto } from "@/features/plants/plantPhoto";
import { t } from "@/utils/i18n";
import { useIsMounted } from "@/utils/useIsMounted";

type PhotoIdentificationProps = {
	photoUri: string | null;
	scientificName: string;
	// Applied to the form as it is then, the user may have typed meanwhile
	onApply: (suggestion: Suggestion, formerSuggestions: Suggestion[]) => void;
};

// Give it the photo as key: another photo starts the identification over
export function PhotoIdentification({
	photoUri,
	scientificName,
	onApply,
}: PhotoIdentificationProps) {
	const identification = useIdentify();
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const mounted = useIsMounted();
	const alreadyIdentified = useIdentifiedPhotoStore(
		(state) => state.photoUri !== null && state.photoUri === photoUri,
	);

	// An encyclopedia photo already comes with its plant, like one identified there
	if (
		!identification.enabled ||
		!photoUri ||
		isRemotePhoto(photoUri) ||
		alreadyIdentified
	) {
		return null;
	}

	if (suggestions.length > 0) {
		return (
			<IdentificationSuggestions
				suggestions={suggestions}
				selected={scientificName}
				onSelect={(suggestion) => onApply(suggestion, suggestions)}
			/>
		);
	}

	return (
		<Button
			variant="outline"
			icon="scan-outline"
			title={t("identification.identifyPhoto")}
			loading={identification.identifying}
			onPress={async () => {
				const found = await identification.identify(photoUri);
				const best = found?.[0];
				if (!found || !best || !mounted.current) return;
				setSuggestions(found);
				onApply(best, []);
			}}
		/>
	);
}
