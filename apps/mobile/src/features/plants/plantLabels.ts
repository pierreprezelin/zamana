import type { Plant } from "@/features/plants/plantSchema";

export const displayName = ({
	nickname,
	name,
}: Pick<Plant, "nickname" | "name">) => (nickname ? `“${nickname}”` : name);
