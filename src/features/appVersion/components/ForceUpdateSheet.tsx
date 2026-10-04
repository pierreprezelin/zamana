import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { nativeApplicationVersion } from "expo-application";
import { useEffect, useRef } from "react";
import { Linking, Platform } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { isUpdateRequired } from "@/features/appVersion/updateRequired";

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
			title="Zamana a besoin d’une mise à jour"
			closable={false}
		>
			<Text className="text-secondary">
				Une nouvelle version corrige un problème important. Mettez l'application
				à jour pour continuer à prendre soin de vos plantes 🌱
			</Text>
			<Button
				title="Mettre à jour maintenant"
				onPress={() => Linking.openURL(STORE_URL)}
				className="mt-5"
			/>
		</BottomSheet>
	);
}
