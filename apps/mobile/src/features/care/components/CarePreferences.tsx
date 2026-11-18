import { View } from "react-native";
import FieldLabel from "@/components/FieldLabel";
import SegmentedControl from "@/components/SegmentedControl";
import Text from "@/components/Text";
import { CLIMATES } from "@/features/care/careTypes";
import {
	SWIPE_RIGHT_ACTIONS,
	useCarePreferencesStore,
} from "@/features/care/useCarePreferencesStore";
import { t } from "@/utils/i18n";

const climateOptions = CLIMATES.map((value) => ({
	value,
	label: t(`care.preferences.climates.${value}`),
}));
const swipeOptions = SWIPE_RIGHT_ACTIONS.map((value) => ({
	value,
	label: t(`care.preferences.swipeActions.${value}`),
}));

export function CarePreferences() {
	const { climate, swipeRight, setClimate, setSwipeRight } =
		useCarePreferencesStore();

	return (
		<>
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
			<View>
				<FieldLabel>{t("care.preferences.swipeRight")}</FieldLabel>
				<SegmentedControl
					options={swipeOptions}
					value={swipeRight}
					onChange={setSwipeRight}
				/>
			</View>
		</>
	);
}
