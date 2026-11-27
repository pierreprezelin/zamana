export type Quota = {
	day: string;
	count: number;
	total: number;
	remaining: number;
};

export const FREE_DAILY_QUOTA = 500;

// Pl@ntNet counts the identifications per UTC day
export const utcDay = (now: Date) => now.toISOString().slice(0, 10);

export const todayQuota = (quota: Quota | null, now: Date): Quota | null => {
	if (!quota) return null;
	const today = utcDay(now);
	return quota.day === today
		? quota
		: { day: today, count: 0, total: quota.total, remaining: quota.total };
};

export const isExhausted = (quota: Quota) => quota.remaining <= 0;

export const nextReset = (now: Date) =>
	new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
	);
