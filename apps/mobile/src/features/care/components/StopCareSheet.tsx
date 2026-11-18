import {
	type BottomSheetModal,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { type Ref, useState } from "react";
import Toast from "react-native-toast-message";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { careName } from "@/features/care/careLabels";
import type { Care } from "@/features/care/careTypes";
import { useCareStore } from "@/features/care/useCareStore";
import { t } from "@/utils/i18n";

type StopCareSheetProps = {
	ref: Ref<BottomSheetModal>;
	care: Care;
};

export function StopCareSheet({ ref, care }: StopCareSheetProps) {
	const stopCare = useCareStore((state) => state.stopCare);
	const { dismiss, dismissAll } = useBottomSheetModal();
	const [stopping, setStopping] = useState(false);
	const name = careName(care.type);

	const stop = async () => {
		setStopping(true);
		try {
			await stopCare(care.id);
			dismissAll();
		} catch {
			Toast.show({ type: "error", text1: t("care.actionFailed") });
		} finally {
			setStopping(false);
		}
	};

	return (
		<BottomSheet
			ref={ref}
			title={t("care.stop.title", { care: name })}
			actions={
				<>
					<Button
						variant="danger"
						title={t("care.stop.confirm")}
						loading={stopping}
						onPress={stop}
					/>
					<Button
						variant="ghost"
						title={t("common.cancel")}
						onPress={() => dismiss()}
					/>
				</>
			}
		>
			<Text className="text-muted">
				{t("care.stop.description", { care: name })}
			</Text>
		</BottomSheet>
	);
}
