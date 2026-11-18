import { View } from "react-native";
import FieldLabel from "@/components/FieldLabel";
import SegmentedControl from "@/components/SegmentedControl";
import Text from "@/components/Text";
import { CLIMATES } from "@/features/care/careTypes";
import {
	SWIPE_LEFT_ACTIONS,
	useCarePreferencesStore,
} from "@/features/care/useCarePreferencesStore";
import { t } from "@/utils/i18n";

const climateOptions = CLIMATES.map((value) => ({
	value,
	label: t(`care.preferences.climates.${value}`),
}));
const swipeOptions = SWIPE_LEFT_ACTIONS.map((value) => ({
	value,
	label: t(`care.preferences.swipeActions.${value}`),
}));

export function ClimateSelector() {
	const climate = useCarePreferencesStore((state) => state.climate);
	const setClimate = useCarePreferencesStore((state) => state.setClimate);

	return (
		<View>
			<FieldLabel>{t("care.preferences.climate")}</FieldLabel>
			<SegmentedControl
				options={climateOptions}
				value={climate}
				onChange={setClimate}
			/>
			<Text className="mt-2 text-xs text-muted">
				{t("care.preferences.climateHelper")}
			</Text>
		</View>
	);
}

export function SwipeSelector() {
	const swipeLeft = useCarePreferencesStore((state) => state.swipeLeft);
	const setSwipeLeft = useCarePreferencesStore((state) => state.setSwipeLeft);

	return (
		<View>
			<FieldLabel>{t("care.preferences.swipeLeft")}</FieldLabel>
			<SegmentedControl
				options={swipeOptions}
				value={swipeLeft}
				onChange={setSwipeLeft}
			/>
		</View>
	);
}
