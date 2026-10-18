import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import BottomSheet from "@/components/BottomSheet";
import SettingsRow from "@/components/SettingsRow";
import { UserNameForm } from "@/features/user/components/UserNameForm";
import { useUserStore } from "@/features/user/useUserStore";
import { t } from "@/utils/i18n";

export function UserNameSetting() {
	const name = useUserStore((state) => state.name);
	const sheetRef = useRef<BottomSheetModal>(null);

	return (
		<>
			<SettingsRow
				icon="chatbubble-ellipses-outline"
				title={t("settings.userName.title")}
				value={name ?? t("settings.userName.empty")}
				onPress={() => sheetRef.current?.present()}
			/>
			<BottomSheet ref={sheetRef} title={t("settings.userName.title")}>
				<UserNameForm />
			</BottomSheet>
		</>
	);
}
