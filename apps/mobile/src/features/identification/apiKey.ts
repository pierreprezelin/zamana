import { z } from "zod";

// Pl@ntNet keys are 24 letters and digits today: a looser bound survives a format change
export const apiKeySchema = z
	.string()
	.trim()
	.regex(/^[A-Za-z0-9]{16,64}$/);

const SHOWN_KEY_END = 4;

export const maskKey = (key: string) => `•••• ${key.slice(-SHOWN_KEY_END)}`;
