import {
	Link,
	router,
	Stack,
	useLocalSearchParams,
	usePathname,
} from "expo-router";
import {
	TabList,
	TabSlot,
	Tabs,
	TabTrigger,
	type TabTriggerSlotProps,
} from "expo-router/ui";
import { useRef } from "react";
import { View } from "react-native";
import Chip from "@/components/Chip";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import type { IoniconsIconName } from "@/components/ionicons";
import { MessageScreen } from "@/components/MessageScreen";
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
			icon: "document-text-outline",
			iconSize: 22,
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
	const wasShown = useRef(false);
	if (plant) wasShown.current = true;

	if (!plant) {
		// Just deleted, the screen is being dismissed
		if (wasShown.current) return null;
		return (
			<MessageScreen
				title={t("common.pageNotFound")}
				text={t("plant.notFound")}
				action={{
					title: t("plant.backToGarden"),
					icon: "leaf-outline",
					onPress: () => router.replace("/garden"),
				}}
			/>
		);
	}

	const section = sections.find(
		(section) => pathname === `/plant/${id}${section.path}`,
	);
	// The history of a past plant is read-only
	const headerAction =
		plant.archivedAt && section?.name === "history"
			? undefined
			: section?.headerAction;

	return (
		// Back leaves the plant, wherever it was opened, instead of walking back through its sections
		<Tabs style={{ flex: 1 }} options={{ backBehavior: "none" }}>
			<Stack.Screen
				options={{
					headerRight: () => (
						<View className="-mr-3 flex-row">
							{headerAction && (
								<Link href={`/plant/${id}${headerAction.path}`} asChild>
									<HeaderIconButton
										icon={headerAction.icon}
										iconSize={headerAction.iconSize}
										accessibilityLabel={headerAction.label}
									/>
								</Link>
							)}
							<Link
								href={{ pathname: "/plant/new", params: { from: id } }}
								asChild
							>
								<HeaderIconButton
									icon="copy-outline"
									iconSize={20}
									accessibilityLabel={t("plant.info.duplicate")}
								/>
							</Link>
						</View>
					),
				}}
			/>
			{/* Tabs only reads the triggers of a TabList it holds directly, so the chips below refer to them by name */}
			<TabList style={{ display: "none" }}>
				{sections.map((section) => (
					<TabTrigger
						key={section.name}
						name={section.name}
						href={`/plant/${id}${section.path}`}
					/>
				))}
			</TabList>
			<View className="gap-4 px-4 pb-3">
				<View className="flex-row items-center gap-4">
					<PlantPhoto photo={plant.photo} className="size-16 rounded-2xl" />
					<View className="flex-1">
						<Text
							// The nickname and name length limits keep the shrink around 22px
							numberOfLines={plant.nickname ? 1 : 2}
							adjustsFontSizeToFit
							minimumFontScale={0.78}
							className="font-recoleta text-page-title text-foreground"
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
				<View className="flex-row gap-2">
					{sections.map((section) => (
						<TabTrigger
							key={section.name}
							name={section.name}
							// Remounts the section, so it opens scrolled to the top
							resetOnFocus
							asChild
						>
							<TabChip
								label={section.label}
								selected={pathname === `/plant/${id}${section.path}`}
							/>
						</TabTrigger>
					))}
				</View>
			</View>
			<TabSlot />
		</Tabs>
	);
}
