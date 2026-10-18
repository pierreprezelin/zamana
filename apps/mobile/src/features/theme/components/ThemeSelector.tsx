import { View } from "react-native";
import FieldLabel from "@/components/FieldLabel";
import SegmentedControl from "@/components/SegmentedControl";
import {
	type ThemePreference,
	useThemeStore,
} from "@/features/theme/useThemeStore";
import { t } from "@/utils/i18n";

const themeOptions: { value: ThemePreference; label: string }[] = [
	{ value: "light", label: t("settings.theme.light") },
	{ value: "dark", label: t("settings.theme.dark") },
	{ value: "system", label: t("settings.theme.system") },
];

export function ThemeSelector() {
	const preference = useThemeStore((state) => state.preference);
	const setPreference = useThemeStore((state) => state.setPreference);

	return (
		<View>
			<FieldLabel>{t("settings.appearance")}</FieldLabel>
			<SegmentedControl
				options={themeOptions}
				value={preference}
				onChange={setPreference}
			/>
		</View>
	);
}
