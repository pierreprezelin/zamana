import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { withUniwind } from "uniwind";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { type PhotoSource, pickPhoto } from "@/features/plants/plantPhoto";
import { useGridTileWidth } from "@/features/plants/useGridTileWidth";

const StyledImage = withUniwind(Image);

type PhotoPickerProps = {
	uri: string | null;
	onChange: (uri: string | null) => void;
};

export function PhotoPicker({ uri, onChange }: PhotoPickerProps) {
	const sheetRef = useRef<BottomSheetModal>(null);
	const tileWidth = useGridTileWidth();

	const pick = async (source: PhotoSource) => {
		sheetRef.current?.dismiss();
		try {
			const picked = await pickPhoto(source);
			if (picked) onChange(picked);
		} catch (error) {
			Toast.show({
				type: "error",
				text1:
					error instanceof Error
						? error.message
						: "L’import de la photo a échoué",
			});
		}
	};

	return (
		<View>
			{uri ? (
				// Same size as a tile of the garden grid
				<View className="flex-row items-center gap-5">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Changer la photo"
						pressedClassName=""
						pressedOpacity={0.75}
						onPress={() => sheetRef.current?.present()}
						className="aspect-square rounded-2xl"
						style={{ width: tileWidth }}
					>
						<StyledImage
							source={{ uri }}
							contentFit="cover"
							className="size-full"
						/>
					</Pressable>
					<View className="items-start gap-3">
						<Button
							variant="ghost"
							title="Importer une autre photo"
							textClassName="text-primary"
							// Same side padding as the ~14px left above and below the label
							className="border border-dashed border-primary px-3.5"
							onPress={() => sheetRef.current?.present()}
						/>
						<Button
							variant="ghostDanger"
							title="Supprimer la photo"
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
					accessibilityLabel="Prendre ou importer une photo"
					pressedClassName=""
					pressedOpacity={0.75}
					onPress={() => sheetRef.current?.present()}
					className="items-center justify-center rounded-2xl border border-dashed border-primary bg-primary-tint"
					// Same height as the imported photo square
					style={{ height: tileWidth }}
				>
					<Ionicons
						name="camera-outline"
						size={24}
						className="mb-2 text-primary"
					/>
					<Text className="text-foreground">Prendre ou importer une photo</Text>
					<Text className="text-xs text-muted">2Mo max.</Text>
				</Pressable>
			)}
			<BottomSheet
				ref={sheetRef}
				title="Photo de la plante"
				actions={
					<>
						<Button
							title="Prendre une photo"
							icon="camera-outline"
							onPress={() => pick("camera")}
						/>
						<Button
							variant="ghost"
							title="Choisir dans la galerie"
							icon="images-outline"
							onPress={() => pick("library")}
						/>
					</>
				}
			/>
		</View>
	);
}
