import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { RefObject } from "react";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import {
	PhotoError,
	type PhotoSource,
	pickPhoto,
} from "@/features/plants/plantPhoto";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

type PhotoSourceSheetProps = {
	sheetRef: RefObject<BottomSheetModal | null>;
	onPicked: (uri: string) => void;
	// Crop ratio, square by default like the garden tiles
	aspect?: [number, number];
};

export function PhotoSourceSheet({
	sheetRef,
	onPicked,
	aspect = [1, 1],
}: PhotoSourceSheetProps) {
	const pick = async (source: PhotoSource) => {
		sheetRef.current?.dismiss();
		try {
			const picked = await pickPhoto(source, aspect);
			if (picked) onPicked(picked);
		} catch (error) {
			showErrorToast(
				error instanceof PhotoError
					? error.message
					: t("plant.photo.importFailed"),
			);
		}
	};

	return (
		<BottomSheet
			ref={sheetRef}
			title={t("plant.photo.sheetTitle")}
			actions={
				<>
					<Button
						title={t("plant.photo.takePhoto")}
						icon="camera-outline"
						onPress={() => pick("camera")}
					/>
					<Button
						variant="ghost"
						title={t("plant.photo.chooseFromLibrary")}
						icon="images-outline"
						onPress={() => pick("library")}
					/>
				</>
			}
		/>
	);
}
