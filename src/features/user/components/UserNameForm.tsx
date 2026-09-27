import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useState } from "react";
import Toast from "react-native-toast-message";
import Button from "@/components/Button";
import FieldInput from "@/components/FieldInput";
import Text from "@/components/Text";
import {
	USER_NAME_MAX_LENGTH,
	userNameSchema,
} from "@/features/user/userNameSchema";
import { useUserStore } from "@/features/user/useUserStore";

export function UserNameForm() {
	const savedName = useUserStore((state) => state.name);
	const saveName = useUserStore((state) => state.saveName);
	const { dismiss } = useBottomSheetModal();
	const [name, setName] = useState(savedName ?? "");
	const [error, setError] = useState<string>();
	const [saving, setSaving] = useState(false);

	const submit = async () => {
		const result = userNameSchema.safeParse(name);
		if (!result.success) {
			setError(result.error.issues[0]?.message);
			return;
		}

		setSaving(true);
		try {
			await saveName(result.data);
			dismiss();
			Toast.show({
				type: "success",
				text1: result.data
					? "Votre nom a bien été enregistré ! 🎉"
					: "Votre nom a bien été supprimé ! 🎉",
			});
		} catch {
			setError("L'enregistrement a échoué, réessayez");
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<Text className="text-secondary">
				Si aucun nom n’est renseigné, les messages seront neutres (ex : “Bonjour
				👋”).
			</Text>
			<FieldInput
				inBottomSheet
				accessibilityLabel="Mon nom dans l’application"
				placeholder="Ex : Camille"
				value={name}
				onChangeText={(text) => {
					setName(text);
					setError(undefined);
				}}
				error={error}
				maxLength={USER_NAME_MAX_LENGTH}
				autoCapitalize="words"
				autoComplete="given-name"
				autoCorrect={false}
				returnKeyType="done"
				onSubmitEditing={submit}
			/>
			<Button
				title="Enregistrer"
				loading={saving}
				onPress={submit}
				className="mt-5"
			/>
		</>
	);
}
