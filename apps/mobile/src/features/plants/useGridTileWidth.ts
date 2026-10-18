import { useWindowDimensions } from "react-native";

const SCREEN_PADDING = 20;
const GRID_GAP = 8;
export const GRID_COLUMNS = 3;

// Width of a plant tile in the garden grid, also used for the form photo
export const useGridTileWidth = () => {
	const { width } = useWindowDimensions();
	return (
		(width - SCREEN_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
	);
};
