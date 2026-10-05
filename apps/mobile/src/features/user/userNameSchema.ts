import { z } from "zod";

export const USER_NAME_MAX_LENGTH = 20;

export const userNameSchema = z
	.string()
	.trim()
	.max(
		USER_NAME_MAX_LENGTH,
		`Le nom ne peut pas dépasser ${USER_NAME_MAX_LENGTH} caractères.`,
	)
	// Typographic apostrophe included: iOS keyboards insert it by default
	.regex(
		/^[a-zA-ZÀ-ÖØ-öø-ÿ'’-]*$/,
		"Le nom doit comporter uniquement des lettres, un tiret ou une apostrophe.",
	)
	.transform((name) => name || null);
