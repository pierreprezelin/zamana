import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToggleRow from "@/components/ToggleRow";
import { SwipeSelector } from "@/features/care/components/CarePreferences";
import { useHapticsStore } from "@/utils/haptics";
import { t } from "@/utils/i18n";

export default function ErgonomicsSettingsScreen() {
	const { bottom } = useSafeAreaInsets();
	const hapticsEnabled = useHapticsStore((state) => state.enabled);
	const setHapticsEnabled = useHapticsStore((state) => state.setEnabled);

	return (
		<View className="flex-1 gap-6 p-4" style={{ paddingBottom: bottom + 16 }}>
			<SwipeSelector />
			<ToggleRow
				label={t("settings.haptics.title")}
				helper={t("settings.haptics.helper")}
				value={hapticsEnabled}
				onChange={setHapticsEnabled}
			/>
		</View>
	);
}
