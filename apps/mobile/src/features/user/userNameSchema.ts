import { z } from "zod";
import { t } from "@/utils/i18n";

export const USER_NAME_MAX_LENGTH = 20;

export const userNameSchema = z
	.string()
	.trim()
	.max(
		USER_NAME_MAX_LENGTH,
		t("settings.userName.tooLong", { max: USER_NAME_MAX_LENGTH }),
	)
	// Typographic apostrophe included: iOS keyboards insert it by default
	.regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ'’-]*$/, t("settings.userName.invalid"))
	.transform((name) => name || null);
