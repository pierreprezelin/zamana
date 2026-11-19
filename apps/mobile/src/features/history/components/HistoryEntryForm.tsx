import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "@/components/Button";
import FieldInput from "@/components/FieldInput";
import Text from "@/components/Text";
import { ConfirmSheet } from "@/features/history/components/ConfirmSheet";
import {
	historyEntrySchema,
	NOTE_MAX_LENGTH,
} from "@/features/history/historySchema";
import type { HistoryEntry } from "@/features/history/historyTypes";
import { useHistoryStore } from "@/features/history/useHistoryStore";
import { PhotoPicker } from "@/features/plants/components/PhotoPicker";
import { deletePhoto, photoUri, savePhoto } from "@/features/plants/plantPhoto";
import { formatDateTime } from "@/utils/dates";
import { successFeedback } from "@/utils/haptics";
import { t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

type HistoryEntryFormProps = {
	plantId: string;
	entry?: HistoryEntry;
};

export function HistoryEntryForm({ plantId, entry }: HistoryEntryFormProps) {
	const { createEntry, updateEntry, deleteEntry } = useHistoryStore.getState();
	const headerHeight = useHeaderHeight();
	const { bottom } = useSafeAreaInsets();
	const [initialPhotoUri] = useState(() =>
		entry?.photo ? photoUri(entry.photo) : null,
	);
	const [pickedUri, setPickedUri] = useState(initialPhotoUri);
	const [note, setNote] = useState(entry?.note ?? "");
	const [saving, setSaving] = useState(false);
	const deleteSheetRef = useRef<BottomSheetModal>(null);
	// A new entry is dated when saved, a few minutes at most after the date shown
	const [openedAt] = useState(() => new Date().toISOString());

	const result = historyEntrySchema.safeParse({ photo: pickedUri, note });

	const submit = async () => {
		if (!result.success) return;
		setSaving(true);
		let photo: string | null = null;
		try {
			photo =
				pickedUri === initialPhotoUri
					? (entry?.photo ?? null)
					: pickedUri && (await savePhoto(pickedUri));
			const input = { photo, note: result.data.note };
			if (entry) {
				await updateEntry(entry.id, input);
			} else {
				await createEntry(plantId, input);
				successFeedback();
			}
			router.back();
			Toast.show({ type: "success", text1: t("history.saved") });
		} catch {
			// The copied photo would be left with no entry pointing to it
			if (photo && photo !== entry?.photo) deletePhoto(photo);
			showErrorToast(t("common.saveFailed"));
		} finally {
			setSaving(false);
		}
	};

	const remove = async () => {
		if (!entry) return;
		try {
			await deleteEntry(entry.id);
			router.back();
			Toast.show({ type: "success", text1: t("history.deleted") });
		} catch {
			showErrorToast(t("common.saveFailed"));
		}
	};

	return (
		<KeyboardAvoidingView
			behavior="padding"
			keyboardVerticalOffset={headerHeight}
			className="flex-1"
		>
			<Stack.Screen
				options={{
					title: entry ? t("history.editEntry") : t("history.newEntry"),
				}}
			/>
			<ScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerClassName="gap-6 px-4 pb-5.5"
			>
				<Text className="text-muted">
					{formatDateTime(entry?.createdAt ?? openedAt)}
				</Text>
				<PhotoPicker uri={pickedUri} onChange={setPickedUri} aspect={[3, 2]} />
				<View className="gap-2">
					<Text className="font-outfit-semibold text-foreground">
						{t("history.note")}
					</Text>
					<FieldInput
						accessibilityLabel={t("history.note")}
						value={note}
						onChangeText={setNote}
						maxLength={NOTE_MAX_LENGTH}
						multiline
						textAlignVertical="top"
						className="h-50 py-3"
					/>
					<Text
						className={`text-right text-xs ${note.length >= NOTE_MAX_LENGTH ? "text-danger" : "text-muted"}`}
					>
						{t("history.noteCount", {
							count: note.length,
							max: NOTE_MAX_LENGTH,
						})}
					</Text>
				</View>
			</ScrollView>

			<View
				className="gap-2 bg-background px-4 pt-2.5"
				style={{ paddingBottom: bottom }}
			>
				<Button
					title={t("history.save")}
					loading={saving}
					disabled={!result.success}
					className={result.success ? undefined : "opacity-50"}
					onPress={submit}
				/>
				{entry && (
					<Button
						variant="ghostDanger"
						title={t("history.delete")}
						onPress={() => deleteSheetRef.current?.present()}
					/>
				)}
			</View>

			{entry && (
				<ConfirmSheet
					ref={deleteSheetRef}
					title={t("history.deleteEntrySheet.title")}
					description={t("history.deleteEntrySheet.description")}
					confirmLabel={t("history.deleteEntrySheet.confirm")}
					onConfirm={remove}
				/>
			)}
		</KeyboardAvoidingView>
	);
}
