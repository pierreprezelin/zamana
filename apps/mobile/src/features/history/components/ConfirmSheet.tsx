import {
	type BottomSheetModal,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import type { Ref } from "react";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

type ConfirmSheetProps = {
	ref: Ref<BottomSheetModal>;
	title: string;
	description: string;
	confirmLabel: string;
	// Handles its own errors: the sheet is already closed, its screen may be leaving
	onConfirm: () => void;
};

export function ConfirmSheet({
	ref,
	title,
	description,
	confirmLabel,
	onConfirm,
}: ConfirmSheetProps) {
	const { dismiss } = useBottomSheetModal();

	const confirm = () => {
		dismiss();
		onConfirm();
	};

	return (
		<BottomSheet
			ref={ref}
			title={title}
			actions={
				<>
					<Button variant="danger" title={confirmLabel} onPress={confirm} />
					<Button
						variant="ghost"
						title={t("common.cancel")}
						onPress={() => dismiss()}
					/>
				</>
			}
		>
			<Text className="text-muted">{description}</Text>
		</BottomSheet>
	);
}
