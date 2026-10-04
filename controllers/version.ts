import type { Request, Response } from "express";

export const getVersion = (_req: Request, res: Response) => {
	const minAppVersion = process.env.MIN_APP_VERSION;

	if (!minAppVersion) {
		res.status(500).json({ error: "MIN_APP_VERSION is not configured" });
		return;
	}

	res.status(200).json({ minAppVersion });
};
