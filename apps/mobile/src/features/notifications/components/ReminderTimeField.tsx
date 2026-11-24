import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Platform } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import FieldButton from "@/components/FieldButton";
import {
	atReminderTime,
	formatReminderTime,
	type ReminderTime,
	toReminderTime,
} from "@/features/notifications/reminderTime";
import { locale, t } from "@/utils/i18n";

type ReminderTimeFieldProps = {
	title: string;
	value: ReminderTime;
	defaultValue: ReminderTime;
	onChange: (value: ReminderTime) => void;
	disabled?: boolean;
};

export function ReminderTimeField({
	title,
	value,
	defaultValue,
	onChange,
	disabled,
}: ReminderTimeFieldProps) {
	const sheetRef = useRef<BottomSheetModal>(null);
	const [androidDialogOpen, setAndroidDialogOpen] = useState(false);
	const pickerProps = {
		mode: "time" as const,
		value: atReminderTime(value, new Date()),
		onValueChange: (_event: unknown, date: Date) => {
			setAndroidDialogOpen(false);
			onChange(toReminderTime(date));
		},
	};

	return (
		<>
			<FieldButton
				value={formatReminderTime(value)}
				placeholder={title}
				icon="time-outline"
				accessibilityLabel={title}
				disabled={disabled}
				onClear={
					value === defaultValue ? undefined : () => onChange(defaultValue)
				}
				clearKind="reset"
				clearLabel={t("notifications.resetTime", {
					time: formatReminderTime(defaultValue),
				})}
				onPress={() =>
					Platform.OS === "android"
						? setAndroidDialogOpen(true)
						: sheetRef.current?.present()
				}
			/>
			{Platform.OS === "android" ? (
				androidDialogOpen && (
					<DateTimePicker
						{...pickerProps}
						is24Hour
						onDismiss={() => setAndroidDialogOpen(false)}
					/>
				)
			) : (
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
					<DateTimePicker
						{...pickerProps}
						display="spinner"
						locale={locale()}
					/>
				</BottomSheet>
			)}
		</>
	);
}
