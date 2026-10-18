import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { type Ref, useState } from "react";
import Toast from "react-native-toast-message";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import OptionList from "@/components/OptionList";
import Text from "@/components/Text";
import { displayName } from "@/features/plants/plantLabels";
import { archiveReasonOptions } from "@/features/plants/plantOptions";
import type { ArchiveReason, Plant } from "@/features/plants/plantSchema";
import { usePlantStore } from "@/features/plants/usePlantStore";

type ArchiveSheetProps = {
	ref: Ref<BottomSheetModal>;
	plant: Plant;
	onDone: () => void;
};

export function ArchiveSheet({ ref, plant, onDone }: ArchiveSheetProps) {
	const archivePlant = usePlantStore((state) => state.archivePlant);
	const [reason, setReason] = useState<ArchiveReason | null>(null);
	const [saving, setSaving] = useState(false);

	const archive = async () => {
		if (!reason) return;
		setSaving(true);
		try {
			await archivePlant(plant.id, reason);
			onDone();
			router.dismissTo({ pathname: "/garden", params: { tab: "past" } });
			Toast.show({
				type: "success",
				text1: `${displayName(plant)} est passée dans les plantes passées`,
			});
		} catch {
			Toast.show({ type: "error", text1: "L'archivage a échoué, réessayez" });
		} finally {
			setSaving(false);
		}
	};

	return (
		<BottomSheet
			ref={ref}
			title="Je n’ai plus cette plante"
			actions={
				<Button
					variant="danger"
					title="Confirmer"
					disabled={!reason}
					loading={saving}
					onPress={archive}
				/>
			}
		>
			<Text className="text-muted">
				Elle rejoindra l’onglet « Passées » de votre jardin. Vous pourrez la
				replacer à tout moment.
			</Text>
			<OptionList
				options={archiveReasonOptions}
				selected={[reason]}
				// Tapping the selected reason clears it
				onPress={(value) =>
					setReason((current) => (current === value ? null : value))
				}
			/>
		</BottomSheet>
	);
}
