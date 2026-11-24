import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import type { Ref } from "react";
import Toast from "react-native-toast-message";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { displayName } from "@/features/plants/plantLabels";
import type { Plant } from "@/features/plants/plantSchema";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

type DeletePlantSheetProps = {
	ref: Ref<BottomSheetModal>;
	plant: Plant;
	onCancel: () => void;
};

export function DeletePlantSheet({
	ref,
	plant,
	onCancel,
}: DeletePlantSheetProps) {
	const deletePlant = usePlantStore((state) => state.deletePlant);
	const name = displayName(plant);

	const remove = async () => {
		try {
			await deletePlant(plant.id);
			// Leaves the edit and information screens of a plant that no longer exists
			router.dismissAll();
			Toast.show({
				type: "success",
				text1: t("plant.delete.deleted", { name }),
			});
		} catch {
			showErrorToast(t("plant.delete.failed"));
		}
	};

	return (
		<ConfirmSheet
			ref={ref}
			title={t("plant.delete.title", { name })}
			description={t("plant.delete.description")}
			confirmLabel={t("plant.delete.confirm")}
			onConfirm={remove}
			onCancel={onCancel}
		/>
	);
}
