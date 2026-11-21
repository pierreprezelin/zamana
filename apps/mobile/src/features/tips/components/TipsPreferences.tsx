import { View } from "react-native";
import Toast from "react-native-toast-message";
import Button from "@/components/Button";
import ToggleRow from "@/components/ToggleRow";
import { useTipStore } from "@/features/tips/useTipStore";
import { t } from "@/utils/i18n";

export function TipsPreferences() {
	const enabled = useTipStore((state) => state.enabled);
	const setEnabled = useTipStore((state) => state.setEnabled);
	const reset = useTipStore((state) => state.reset);

	return (
		<View className="gap-4">
			<ToggleRow
				label={t("tips.preferences.show")}
				helper={t("tips.preferences.showHelper")}
				value={enabled}
				onChange={setEnabled}
			/>
			<Button
				title={t("tips.preferences.reset")}
				variant="ghost"
				icon="refresh-outline"
				onPress={() => {
					reset();
					Toast.show({
						type: "success",
						text1: t("tips.preferences.resetDone"),
					});
				}}
			/>
		</View>
	);
}
