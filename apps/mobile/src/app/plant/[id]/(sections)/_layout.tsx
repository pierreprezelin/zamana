import { Link, Stack, useLocalSearchParams, usePathname } from "expo-router";
import {
	TabList,
	TabSlot,
	Tabs,
	TabTrigger,
	type TabTriggerSlotProps,
} from "expo-router/ui";
import { View } from "react-native";
import Chip from "@/components/Chip";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import type { IoniconsIconName } from "@/components/ionicons";
import Text from "@/components/Text";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { displayName } from "@/features/plants/plantLabels";
import { usePlant } from "@/features/plants/usePlantStore";
import { t } from "@/utils/i18n";

type Section = {
	name: string;
	path: "" | "/care" | "/history";
	label: string;
	// Shortcut on the right of the header, aligned with the back arrow
	headerAction?: {
		icon: IoniconsIconName;
		// Glyph about as big as the 17×16 back arrow
		iconSize: number;
		label: string;
		path: "/edit" | "/history-entry";
	};
};

const sections: Section[] = [
	{
		name: "index",
		path: "",
		label: t("plant.info.sections.information"),
		headerAction: {
			icon: "pencil-outline",
			iconSize: 20,
			label: t("plant.info.edit"),
			path: "/edit",
		},
	},
	{ name: "care", path: "/care", label: t("plant.info.sections.care") },
	{
		name: "history",
		path: "/history",
		label: t("plant.info.sections.history"),
		headerAction: {
			icon: "add-outline",
			iconSize: 24,
			label: t("plant.info.addHistoryEntry"),
			path: "/history-entry",
		},
	},
];

type TabChipProps = TabTriggerSlotProps & {
	label: string;
	selected: boolean;
};

// Drops the trigger's own row style, which would push the label to the left
function TabChip({ isFocused, style, ref, href, ...props }: TabChipProps) {
	return <Chip {...props} />;
}

export default function PlantSectionsLayout() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const plant = usePlant(id);
	const pathname = usePathname();

	// The plant was just deleted, the screen is being dismissed
	if (!plant) return null;

	const headerAction = sections.find(
		(section) => pathname === `/plant/${id}${section.path}`,
	)?.headerAction;

	return (
		<Tabs style={{ flex: 1 }}>
			<Stack.Screen
				options={{
					headerRight: headerAction
						? () => (
								<Link href={`/plant/${id}${headerAction.path}`} asChild>
									<HeaderIconButton
										icon={headerAction.icon}
										iconSize={headerAction.iconSize}
										accessibilityLabel={headerAction.label}
									/>
								</Link>
							)
						: undefined,
				}}
			/>
			<View className="gap-5 px-5 pb-2.5">
				<View className="flex-row items-center gap-4">
					<PlantPhoto photo={plant.photo} className="size-16" />
					<View className="flex-1">
						<Text
							numberOfLines={2}
							className="font-recoleta text-[28px] leading-[1.25] text-foreground"
						>
							{displayName(plant)}
						</Text>
						{plant.scientificName && (
							<Text className="text-base text-muted">
								{plant.scientificName}
							</Text>
						)}
					</View>
				</View>
				{/* asChild so Uniwind styles a View rendered here, and the style resets the default space-between */}
				<TabList asChild style={{ justifyContent: "flex-start" }}>
					<View className="flex-row gap-2">
						{sections.map((section) => {
							const href = `/plant/${id}${section.path}` as const;
							return (
								<TabTrigger
									key={section.name}
									name={section.name}
									href={href}
									asChild
								>
									<TabChip label={section.label} selected={pathname === href} />
								</TabTrigger>
							);
						})}
					</View>
				</TabList>
			</View>
			<TabSlot />
		</Tabs>
	);
}
