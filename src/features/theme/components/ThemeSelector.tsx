import { View } from "react-native";
import FieldLabel from "@/components/FieldLabel";
import SegmentedControl from "@/components/SegmentedControl";
import {
	type ThemePreference,
	useThemeStore,
} from "@/features/theme/useThemeStore";

const themeOptions: { value: ThemePreference; label: string }[] = [
	{ value: "light", label: "Clair" },
	{ value: "dark", label: "Sombre" },
	{ value: "system", label: "Système" },
];

export function ThemeSelector() {
	const preference = useThemeStore((state) => state.preference);
	const setPreference = useThemeStore((state) => state.setPreference);

	return (
		<View>
			<FieldLabel>Apparence</FieldLabel>
			<SegmentedControl
				options={themeOptions}
				value={preference}
				onChange={setPreference}
			/>
		</View>
	);
}
