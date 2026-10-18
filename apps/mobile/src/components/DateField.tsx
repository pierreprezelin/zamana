import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Platform } from "react-native";
import { useCSSVariable } from "uniwind";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import FieldButton from "@/components/FieldButton";
import { formatDate, parseISODate, toISODate } from "@/utils/dates";
import { locale, t } from "@/utils/i18n";

type DateFieldProps = {
	title: string;
	placeholder: string;
	value: string | null;
	onChange: (value: string | null) => void;
	error?: string;
};

export default function DateField({
	title,
	placeholder,
	value,
	onChange,
	error,
}: DateFieldProps) {
	const accentColor = useCSSVariable("--color-primary") as string;
	const sheetRef = useRef<BottomSheetModal>(null);
	const [androidDialogOpen, setAndroidDialogOpen] = useState(false);
	const today = new Date();
	const pickerProps = {
		value: value ? parseISODate(value) : today,
		maximumDate: today,
		accentColor,
		onValueChange: (_event: unknown, date: Date) => {
			setAndroidDialogOpen(false);
			onChange(toISODate(date));
		},
	};

	return (
		<>
			<FieldButton
				value={value && formatDate(value)}
				placeholder={placeholder}
				icon="calendar-outline"
				accessibilityLabel={title}
				error={error}
				onPress={() =>
					Platform.OS === "android"
						? setAndroidDialogOpen(true)
						: sheetRef.current?.present()
				}
				onClear={() => onChange(null)}
			/>
			{Platform.OS === "android" ? (
				androidDialogOpen && (
					<DateTimePicker
						{...pickerProps}
						onDismiss={() => setAndroidDialogOpen(false)}
					/>
				)
			) : (
				// iOS always renders the picker inline
				<BottomSheet
					ref={sheetRef}
					title={title}
					actions={
						<Button
							title={t("common.validate")}
							onPress={() => sheetRef.current?.dismiss()}
						/>
					}
				>
					<DateTimePicker {...pickerProps} display="inline" locale={locale()} />
				</BottomSheet>
			)}
		</>
	);
}
