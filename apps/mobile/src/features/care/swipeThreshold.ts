// Drag distance past which releasing a care row triggers its action
export const SWIPE_THRESHOLD = 64;

export function crossedThreshold(previous: number | null, current: number) {
	"worklet";
	if (previous === null) return false;
	return previous >= SWIPE_THRESHOLD !== current >= SWIPE_THRESHOLD;
}
