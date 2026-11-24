import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { View } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import {
	PhotoError,
	type PhotoSource,
	pickPhoto,
} from "@/features/plants/plantPhoto";
import { useGridTileWidth } from "@/features/plants/useGridTileWidth";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

type PhotoPickerProps = {
	uri: string | null;
	onChange: (uri: string | null) => void;
	// Crop ratio, square by default like the garden tiles
	aspect?: [number, number];
};

export function PhotoPicker({
	uri,
	onChange,
	aspect = [1, 1],
}: PhotoPickerProps) {
	const sheetRef = useRef<BottomSheetModal>(null);
	const tileWidth = useGridTileWidth();

	const pick = async (source: PhotoSource) => {
		sheetRef.current?.dismiss();
		try {
			const picked = await pickPhoto(source, aspect);
			if (picked) onChange(picked);
		} catch (error) {
			showErrorToast(
				error instanceof PhotoError
					? error.message
					: t("plant.photo.importFailed"),
			);
		}
	};

	return (
		<View>
			{uri ? (
				// As wide as a tile of the garden grid, in the crop ratio
				<View className="flex-row items-center gap-4">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={t("plant.photo.change")}
						pressedOpacity={0.75}
						onPress={() => sheetRef.current?.present()}
						className="rounded-2xl"
						style={{ width: tileWidth, aspectRatio: aspect[0] / aspect[1] }}
					>
						<PlantPhoto url={uri} className="size-full rounded-2xl" />
					</Pressable>
					<View className="items-start gap-3">
						<Button
							variant="ghost"
							title={t("plant.photo.importAnother")}
							textClassName="text-primary"
							// Same side padding as the ~14px left above and below the label
							className="border border-dashed border-primary px-3.5"
							onPress={() => sheetRef.current?.present()}
						/>
						<Button
							variant="ghostDanger"
							title={t("plant.photo.delete")}
							className="h-auto px-0"
							// The top slop stays within the gap so it never covers the button above
							hitSlop={12}
							onPress={() => onChange(null)}
						/>
					</View>
				</View>
			) : (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={t("plant.photo.add")}
					pressedOpacity={0.75}
					onPress={() => sheetRef.current?.present()}
					className="items-center justify-center rounded-2xl border border-dashed border-primary bg-primary-tint"
					// Same height as an imported square photo
					style={{ height: tileWidth }}
				>
					<Ionicons
						name="camera-outline"
						size={24}
						className="mb-2 text-primary"
					/>
					<Text className="text-foreground">{t("plant.photo.add")}</Text>
				</Pressable>
			)}
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
		</View>
	);
}
