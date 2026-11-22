import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import OptionList, { type Option } from "@/components/OptionList";
import SettingsRow from "@/components/SettingsRow";
import Text from "@/components/Text";
import {
	type LanguagePreference,
	useLanguageStore,
} from "@/features/language/useLanguageStore";
import { t } from "@/utils/i18n";

// Language names stay in their own language, to be found by whoever reads it
const languageOptions: Option<LanguagePreference>[] = [
	{ value: "system", label: t("settings.language.system") },
	{ value: "fr", label: "Français" },
	{ value: "en", label: "English" },
];

const languageLabel = (preference: LanguagePreference) =>
	languageOptions.find(({ value }) => value === preference)?.label;

export function LanguageSetting() {
	const preference = useLanguageStore((state) => state.preference);
	const setPreference = useLanguageStore((state) => state.setPreference);
	const [choice, setChoice] = useState(preference);
	const sheetRef = useRef<BottomSheetModal>(null);

	return (
		<>
			<SettingsRow
				icon="language-outline"
				title={t("settings.language.title")}
				value={languageLabel(preference)}
				onPress={() => {
					setChoice(preference);
					sheetRef.current?.present();
				}}
			/>
			<BottomSheet
				ref={sheetRef}
				title={t("settings.language.title")}
				actions={
					<Button
						title={t("common.validate")}
						disabled={choice === preference}
						onPress={() => {
							sheetRef.current?.dismiss();
							setPreference(choice);
						}}
					/>
				}
			>
				<Text className="text-muted">{t("settings.language.restartHint")}</Text>
				<OptionList
					options={languageOptions}
					selected={[choice]}
					onPress={setChoice}
				/>
			</BottomSheet>
		</>
	);
}
