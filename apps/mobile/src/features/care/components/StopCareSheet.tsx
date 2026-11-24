import {
	type BottomSheetModal,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import type { Ref } from "react";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { careName } from "@/features/care/careLabels";
import type { Care } from "@/features/care/careTypes";
import { useCareStore } from "@/features/care/useCareStore";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

type StopCareSheetProps = {
	ref: Ref<BottomSheetModal>;
	care: Care;
};

export function StopCareSheet({ ref, care }: StopCareSheetProps) {
	const stopCare = useCareStore((state) => state.stopCare);
	const { dismissAll } = useBottomSheetModal();
	const name = careName(care.type);

	const stop = async () => {
		try {
			await stopCare(care.id);
			dismissAll();
		} catch {
			showErrorToast(t("care.actionFailed"));
		}
	};

	return (
		<ConfirmSheet
			ref={ref}
			title={t("care.stop.title", { care: name })}
			description={t("care.stop.description", { care: name })}
			confirmLabel={t("care.stop.confirm")}
			onConfirm={stop}
		/>
	);
}
