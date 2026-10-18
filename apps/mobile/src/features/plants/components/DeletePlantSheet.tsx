import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { type Ref, useState } from "react";
import Toast from "react-native-toast-message";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { displayName } from "@/features/plants/plantLabels";
import type { Plant } from "@/features/plants/plantSchema";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";

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
	const [deleting, setDeleting] = useState(false);
	const name = displayName(plant);

	const remove = async () => {
		setDeleting(true);
		try {
			await deletePlant(plant.id);
			// Leaves the edit and information screens of a plant that no longer exists
			router.dismissAll();
			Toast.show({
				type: "success",
				text1: t("plant.delete.deleted", { name }),
			});
		} catch {
			setDeleting(false);
			Toast.show({
				type: "error",
				text1: t("plant.delete.failed"),
			});
		}
	};

	return (
		<BottomSheet
			ref={ref}
			title={t("plant.delete.title", { name })}
			actions={
				<>
					<Button
						variant="danger"
						title={t("plant.delete.confirm")}
						loading={deleting}
						onPress={remove}
					/>
					<Button
						variant="ghost"
						title={t("common.cancel")}
						onPress={onCancel}
					/>
				</>
			}
		>
			<Text className="text-muted">{t("plant.delete.description")}</Text>
		</BottomSheet>
	);
}
