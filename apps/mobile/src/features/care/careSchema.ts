import { z } from "zod";
import { CARE_TYPES, FREQUENCY_UNITS } from "@/features/care/careTypes";
import { toISODate } from "@/utils/dates";
import { t } from "@/utils/i18n";

const FREQUENCY_MAX = 99;

const month = z.int().min(1).max(12);

export const careInputSchema = z
	.object({
		type: z.enum(CARE_TYPES),
		frequency: z
			.object({
				amount: z
					.number()
					.int(t("care.errors.frequencyOutOfRange", { max: FREQUENCY_MAX }))
					.min(1, t("care.errors.frequencyOutOfRange", { max: FREQUENCY_MAX }))
					.max(
						FREQUENCY_MAX,
						t("care.errors.frequencyOutOfRange", { max: FREQUENCY_MAX }),
					),
				unit: z.enum(FREQUENCY_UNITS),
			})
			.nullable(),
		period: z.object({ startMonth: month, endMonth: month }).nullable(),
		lastDoneAt: z.iso
			.date()
			.refine(
				(date) => date <= toISODate(new Date()),
				t("plant.errors.futureDate"),
			)
			.nullable(),
		reminder: z.boolean(),
	})
	// Watering takes its interval from the plant's watering level
	.refine(
		(care) => care.type === "watering" || !care.reminder || care.frequency,
		{ message: t("care.errors.frequencyRequired"), path: ["frequency"] },
	);

export type CareInput = z.output<typeof careInputSchema>;
