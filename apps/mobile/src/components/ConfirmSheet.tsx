import {
	type BottomSheetModal,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { type Ref, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

type ConfirmSheetProps = {
	ref: Ref<BottomSheetModal>;
	title: string;
	description: string;
	confirmLabel: string;
	// Closes the sheet and handles its own errors: the confirm button spins while it runs
	onConfirm: () => void | Promise<void>;
	onCancel?: () => void;
};

export function ConfirmSheet({
	ref,
	title,
	description,
	confirmLabel,
	onConfirm,
	onCancel,
}: ConfirmSheetProps) {
	const { dismiss } = useBottomSheetModal();
	const [confirming, setConfirming] = useState(false);

	const confirm = async () => {
		setConfirming(true);
		try {
			await onConfirm();
		} finally {
			setConfirming(false);
		}
	};

	return (
		<BottomSheet
			ref={ref}
			title={title}
			actions={
				<>
					<Button
						variant="danger"
						title={confirmLabel}
						loading={confirming}
						onPress={confirm}
					/>
					<Button
						variant="ghost"
						title={t("common.cancel")}
						onPress={onCancel ?? (() => dismiss())}
					/>
				</>
			}
		>
			<Text className="text-muted">{description}</Text>
		</BottomSheet>
	);
}
