import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import BottomSheet from "@/components/BottomSheet";
import SettingsRow from "@/components/SettingsRow";
import { UserNameForm } from "@/features/user/components/UserNameForm";
import { useUserStore } from "@/features/user/useUserStore";

const TITLE = "Mon nom dans l’application";

export function UserNameSetting() {
	const name = useUserStore((state) => state.name);
	const sheetRef = useRef<BottomSheetModal>(null);

	return (
		<>
			<SettingsRow
				icon="chatbubble-ellipses-outline"
				title={TITLE}
				value={name ?? "Non renseigné"}
				onPress={() => sheetRef.current?.present()}
			/>
			<BottomSheet ref={sheetRef} title={TITLE}>
				<UserNameForm />
			</BottomSheet>
		</>
	);
}
