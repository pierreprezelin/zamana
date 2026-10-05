import type { IoniconsIconName } from "@/components/ionicons";

type Tab = {
	name: string;
	href: "/" | "/garden" | "/encyclopedia" | "/tips";
	label: string;
	icon: { default: IoniconsIconName; selected: IoniconsIconName };
};

export const tabs: Tab[] = [
	{
		name: "index",
		href: "/",
		label: "Aujourd’hui",
		icon: { default: "calendar-outline", selected: "calendar" },
	},
	{
		name: "garden",
		href: "/garden",
		label: "Jardin",
		icon: { default: "leaf-outline", selected: "leaf" },
	},
	{
		name: "encyclopedia",
		href: "/encyclopedia",
		label: "Encyclopédie",
		icon: { default: "search-outline", selected: "search" },
	},
	{
		name: "tips",
		href: "/tips",
		label: "Conseils",
		icon: { default: "bookmarks-outline", selected: "bookmarks" },
	},
];
