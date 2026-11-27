import { createContext, useContext, useEffect } from "react";
import type {
	SharedValue,
	useAnimatedScrollHandler,
} from "react-native-reanimated";

type PlantSheetScroll = {
	scrollY: SharedValue<number>;
	onScroll: ReturnType<typeof useAnimatedScrollHandler>;
	// The sections scroll under the plant header, which overlays them
	paddingTop: number;
};

const PlantSheetScrollContext = createContext<PlantSheetScroll | null>(null);

export const PlantSheetScrollProvider = PlantSheetScrollContext.Provider;

export function usePlantSheetScroll() {
	const context = useContext(PlantSheetScrollContext);
	if (!context) {
		throw new Error("usePlantSheetScroll needs a PlantSheetScrollProvider");
	}
	const { scrollY } = context;
	// A section opens scrolled to the top, so the header unfolds again
	useEffect(() => scrollY.set(0), [scrollY]);
	return context;
}
