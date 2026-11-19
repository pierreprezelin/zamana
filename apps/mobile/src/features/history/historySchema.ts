import { z } from "zod";
import { t } from "@/utils/i18n";

export const NOTE_MAX_LENGTH = 500;

export const historyEntrySchema = z
	.object({
		photo: z.string().nullable(),
		note: z
			.string()
			.trim()
			.max(
				NOTE_MAX_LENGTH,
				t("history.errors.noteTooLong", { max: NOTE_MAX_LENGTH }),
			)
			.transform((note) => note || null),
	})
	.refine((entry) => entry.photo || entry.note, {
		message: t("history.errors.empty"),
		path: ["note"],
	});

export type HistoryEntryInput = z.output<typeof historyEntrySchema>;
