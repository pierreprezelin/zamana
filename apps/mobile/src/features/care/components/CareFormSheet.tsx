import {
	type BottomSheetModal,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { type Ref, useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import DateField from "@/components/DateField";
import FieldInput from "@/components/FieldInput";
import FieldLabel from "@/components/FieldLabel";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import Text from "@/components/Text";
import ToggleRow from "@/components/ToggleRow";
import { careName } from "@/features/care/careLabels";
import { wateringIntervalDays } from "@/features/care/careSchedule";
import { careInputSchema } from "@/features/care/careSchema";
import {
	type Care,
	type CareType,
	FREQUENCY_UNITS,
	type FrequencyUnit,
} from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import { StopCareSheet } from "@/features/care/components/StopCareSheet";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import { needs } from "@/features/plants/plantOptions";
import type { Plant } from "@/features/plants/plantSchema";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { toISODate } from "@/utils/dates";
import { locale, pluralForm, t } from "@/utils/i18n";

const LEVELS = ["1", "2", "3"] as const;
// Suggested when switching to "some months": the usual growing season
const DEFAULT_PERIOD = { startMonth: "3", endMonth: "10" };

const wateringLevels =
	needs.find((need) => need.key === "watering")?.levels ?? [];
const levelOptions = LEVELS.map((value, index) => ({
	value,
	label: wateringLevels[index],
}));
const unitOptions = FREQUENCY_UNITS.map((value) => ({
	value,
	label: t(`care.form.units.${value}`),
}));
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
	value: String(index + 1),
	label: new Date(2000, index, 1).toLocaleDateString(locale(), {
		month: "long",
	}),
}));

type CareFormSheetProps = {
	ref: Ref<BottomSheetModal>;
	plant: Plant;
	type: CareType;
	care?: Care;
};

export function CareFormSheet({ ref, plant, type, care }: CareFormSheetProps) {
	const climate = useCarePreferencesStore((state) => state.climate);
	const { createCare, updateCare } = useCareStore.getState();
	const updatePlant = usePlantStore((state) => state.updatePlant);
	const { dismissAll } = useBottomSheetModal();
	const stopSheetRef = useRef<BottomSheetModal>(null);
	const isWatering = type === "watering";

	const [level, setLevel] = useState(
		String(plant.watering) as (typeof LEVELS)[number],
	);
	const [amount, setAmount] = useState(
		care?.frequency ? String(care.frequency.amount) : "",
	);
	const [unit, setUnit] = useState<FrequencyUnit>(
		care?.frequency?.unit ?? "week",
	);
	const [someMonths, setSomeMonths] = useState(Boolean(care?.period));
	const [startMonth, setStartMonth] = useState(
		care?.period ? String(care.period.startMonth) : DEFAULT_PERIOD.startMonth,
	);
	const [endMonth, setEndMonth] = useState(
		care?.period ? String(care.period.endMonth) : DEFAULT_PERIOD.endMonth,
	);
	const [lastDoneAt, setLastDoneAt] = useState(care?.lastDoneAt ?? null);
	const [reminder, setReminder] = useState(care?.reminder ?? true);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);

	const save = async () => {
		const result = careInputSchema.safeParse({
			type,
			frequency:
				!isWatering && amount ? { amount: Number(amount), unit } : null,
			period:
				!isWatering && someMonths
					? { startMonth: Number(startMonth), endMonth: Number(endMonth) }
					: null,
			lastDoneAt,
			reminder,
		});
		if (!result.success) {
			setErrors(
				Object.fromEntries(
					result.error.issues.map((issue) => [
						String(issue.path[0]),
						issue.message,
					]),
				),
			);
			return;
		}
		setSaving(true);
		try {
			if (isWatering && Number(level) !== plant.watering) {
				await updatePlant(plant.id, { ...plant, watering: Number(level) });
			}
			if (care) await updateCare(care.id, result.data);
			else await createCare(plant.id, result.data);
			dismissAll();
		} catch {
			Toast.show({ type: "error", text1: t("common.saveFailed") });
		} finally {
			setSaving(false);
		}
	};

	const intervalDays = wateringIntervalDays(
		Number(level),
		toISODate(new Date()),
		climate,
	);

	return (
		<BottomSheet
			ref={ref}
			title={t(care ? "care.form.editTitle" : "care.form.configureTitle")}
			actions={
				<>
					<Button title={t("common.save")} loading={saving} onPress={save} />
					{care && (
						<Button
							variant="ghostDanger"
							title={t("care.form.stop")}
							onPress={() => stopSheetRef.current?.present()}
						/>
					)}
				</>
			}
		>
			<View>
				<FieldLabel>{t("care.form.type")}</FieldLabel>
				<View className="flex-row items-center gap-3">
					<CareBadge type={type} size={36} />
					<Text className="font-outfit-semibold text-base text-foreground">
						{careName(type)}
					</Text>
				</View>
			</View>

			{isWatering ? (
				<View>
					<FieldLabel>{t("care.form.waterNeed")}</FieldLabel>
					<SegmentedControl
						options={levelOptions}
						value={level}
						onChange={setLevel}
					/>
					<Text className="mt-2 text-xs text-muted">
						{t(`care.form.currentInterval.${pluralForm(intervalDays)}`, {
							amount: intervalDays,
						})}
					</Text>
				</View>
			) : (
				<>
					<View>
						<FieldLabel>{t("care.form.frequency")}</FieldLabel>
						<View className="flex-row items-start gap-2">
							<FieldInput
								inBottomSheet
								className="w-16 text-center"
								keyboardType="number-pad"
								maxLength={2}
								accessibilityLabel={t("care.form.frequencyAmount")}
								value={amount}
								onChangeText={setAmount}
							/>
							<SegmentedControl
								className="flex-1"
								options={unitOptions}
								value={unit}
								onChange={setUnit}
							/>
						</View>
						<Text
							className={`mt-2 text-xs ${errors.frequency ? "text-danger" : "text-muted"}`}
						>
							{errors.frequency ?? t("care.form.frequencyHelper")}
						</Text>
					</View>
					<View className="gap-2">
						<FieldLabel className="mb-0">{t("care.form.period")}</FieldLabel>
						<SegmentedControl
							options={[
								{ value: "all", label: t("care.form.allYear") },
								{ value: "some", label: t("care.form.someMonths") },
							]}
							value={someMonths ? "some" : "all"}
							onChange={(value) => setSomeMonths(value === "some")}
						/>
						{someMonths && (
							<View className="flex-row gap-2">
								<View className="flex-1">
									<SelectField
										title={t("care.form.from")}
										placeholder={t("care.form.from")}
										options={monthOptions}
										value={startMonth}
										onChange={(month) => month && setStartMonth(month)}
									/>
								</View>
								<View className="flex-1">
									<SelectField
										title={t("care.form.to")}
										placeholder={t("care.form.to")}
										options={monthOptions}
										value={endMonth}
										onChange={(month) => month && setEndMonth(month)}
									/>
								</View>
							</View>
						)}
					</View>
				</>
			)}

			<View>
				<FieldLabel>{t("care.form.lastDone")}</FieldLabel>
				<DateField
					title={t("care.form.lastDone")}
					placeholder={t("care.form.lastDonePlaceholder")}
					value={lastDoneAt}
					onChange={setLastDoneAt}
					error={errors.lastDoneAt}
				/>
				<Text className="mt-2 text-xs text-muted">
					{t("care.form.lastDoneHelper")}
				</Text>
			</View>

			<ToggleRow
				label={t("care.form.reminders")}
				helper={t(
					isWatering
						? "care.form.wateringRemindersHelper"
						: "care.form.remindersHelper",
				)}
				value={reminder}
				onChange={setReminder}
			/>

			{care && <StopCareSheet ref={stopSheetRef} care={care} />}
		</BottomSheet>
	);
}
