import { create } from "zustand";
import type { Suggestion } from "@/features/identification/plantnet";

// In memory: the photo is a temporary file of the picker, gone with the app
type IdentifiedPhotoState = {
	photoUri: string | null;
	suggestions: Suggestion[];
	identify: (photoUri: string, suggestions: Suggestion[]) => void;
	clear: () => void;
};

// One empty array: a cleared store does not render its readers again
const NO_SUGGESTIONS: Suggestion[] = [];

export const useIdentifiedPhotoStore = create<IdentifiedPhotoState>()(
	(set) => ({
		photoUri: null,
		suggestions: NO_SUGGESTIONS,
		identify: (photoUri, suggestions) => set({ photoUri, suggestions }),
		clear: () => set({ photoUri: null, suggestions: NO_SUGGESTIONS }),
	}),
);

export const isIdentifiedQuery = (query: string, suggestions: Suggestion[]) =>
	suggestions.some(({ scientificName }) => scientificName === query.trim());

// Only the species found on the photo gets it, not another plant of the results or of a link
export const identifiedPhotoFor = (
	scientificName: string | undefined,
	{
		photoUri,
		suggestions,
	}: Pick<IdentifiedPhotoState, "photoUri" | "suggestions">,
) =>
	scientificName && isIdentifiedQuery(scientificName, suggestions)
		? photoUri
		: null;
