import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { type Ref, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import Toggle from "@/components/Toggle";
import { careName, frequencyLabel } from "@/features/care/careLabels";
import {
	CARE_TYPES,
	type Care,
	type CareType,
} from "@/features/care/careTypes";
import { CareBadge } from "@/features/care/components/CareBadge";
import { CareFormSheet } from "@/features/care/components/CareFormSheet";
import { useCareActions } from "@/features/care/useCareActions";
import type { Plant } from "@/features/plants/plantSchema";
import { t } from "@/utils/i18n";

type ManageCaresSheetProps = {
	ref: Ref<BottomSheetModal>;
	plant: Plant;
	cares: Care[];
};

export function ManageCaresSheet({ ref, plant, cares }: ManageCaresSheetProps) {
	const { setReminder } = useCareActions();
	const formRef = useRef<BottomSheetModal>(null);
	const [editedType, setEditedType] = useState<CareType | null>(null);
	const editedCare = cares.find((care) => care.type === editedType);

	// The form mounts with the chosen care, then opens
	useEffect(() => {
		if (editedType) formRef.current?.present();
	}, [editedType]);

	const edit = (type: CareType) => {
		if (type === editedType) formRef.current?.present();
		else setEditedType(type);
	};

	return (
		<BottomSheet ref={ref} title={t("care.manageSheet.title")}>
			<Text className="text-muted">{t("care.manageSheet.description")}</Text>
			<View className="rounded-2xl border border-line px-4">
				{CARE_TYPES.map((type, index) => {
					const care = cares.find((tracked) => tracked.type === type);
					const name = careName(type);
					return (
						<View
							key={type}
							className={`flex-row items-center gap-3 py-3 ${index ? "border-t border-line" : ""}`}
						>
							<View className={care ? "" : "opacity-50"}>
								<CareBadge type={type} size={36} />
							</View>
							<View className="flex-1">
								<Text className="font-outfit-semibold text-foreground">
									{name}
								</Text>
								<Text className="text-xs text-muted">
									{care
										? frequencyLabel(care, plant.watering)
										: t("care.manageSheet.notTracked")}
								</Text>
							</View>
							{care ? (
								<>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={t("care.manageSheet.edit", {
											care: name,
										})}
										pressedClassName=""
										pressedOpacity={0.5}
										hitSlop={12}
										onPress={() => edit(type)}
									>
										<Ionicons
											name="pencil-outline"
											size={18}
											className="text-foreground"
										/>
									</Pressable>
									<Toggle
										accessibilityLabel={t("care.manageSheet.reminders", {
											care: name,
										})}
										value={care.reminder}
										onChange={(reminder) => setReminder(care, reminder)}
									/>
								</>
							) : (
								<Button
									variant="ghost"
									title={t("care.manageSheet.configure")}
									className="h-9 bg-primary-tint px-4"
									onPress={() => edit(type)}
								/>
							)}
						</View>
					);
				})}
			</View>
			{editedType && (
				<CareFormSheet
					// Starts afresh once the care is created or stopped
					key={`${editedType}-${editedCare?.id}`}
					ref={formRef}
					plant={plant}
					type={editedType}
					care={editedCare}
				/>
			)}
		</BottomSheet>
	);
}
