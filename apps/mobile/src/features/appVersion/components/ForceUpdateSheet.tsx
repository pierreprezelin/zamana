import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { nativeApplicationVersion } from "expo-application";
import { useEffect, useRef } from "react";
import { Linking, Platform } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { isUpdateRequired } from "@/features/appVersion/updateRequired";
import { t } from "@/utils/i18n";

// TODO: replace with the App Store ID once the app is published
const STORE_URL = Platform.select({
	ios: "itms-apps://apps.apple.com/app/idXXXXXXXXXX",
	default: "market://details?id=com.pierreprezelin.zamana",
});

export function ForceUpdateSheet() {
	const sheetRef = useRef<BottomSheetModal>(null);

	useEffect(() => {
		if (!nativeApplicationVersion) return;
		isUpdateRequired(nativeApplicationVersion).then(
			(required) => required && sheetRef.current?.present(),
		);
	}, []);

	return (
		<BottomSheet
			ref={sheetRef}
			title={t("appVersion.title")}
			closable={false}
			actions={
				<Button
					title={t("appVersion.update")}
					onPress={() => Linking.openURL(STORE_URL)}
				/>
			}
		>
			<Text className="text-muted">{t("appVersion.description")}</Text>
		</BottomSheet>
	);
}
