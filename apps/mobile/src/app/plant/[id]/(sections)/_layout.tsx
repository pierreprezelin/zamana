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
import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import Chip from "@/components/Chip";
import {
	FadingHeaderTitle,
	useFadingHeaderTitle,
} from "@/components/FadingHeaderTitle";
import { HeaderIconButton } from "@/components/HeaderIconButton";
import type { IoniconsIconName } from "@/components/ionicons";
import { MessageScreen } from "@/components/MessageScreen";
import Text from "@/components/Text";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { PlantSheetScrollProvider } from "@/features/plants/components/PlantSheetScroll";
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
	const fadingTitle = useFadingHeaderTitle();
	const { scrollY, onScroll } = fadingTitle;
	// Scrolls the photo and name away, the chips then stay under the navigation bar
	const chipsTop = useSharedValue(0);
	const [headerHeight, setHeaderHeight] = useState(0);
	const headerStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: -Math.min(Math.max(scrollY.get(), 0), chipsTop.get()) },
		],
	}));
	const sheetScroll = useMemo(
		// With the header bottom padding, 24px between the chips and the section, as between sections
		() => ({ scrollY, onScroll, paddingTop: headerHeight + 16 }),
		[scrollY, onScroll, headerHeight],
	);

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
					headerTitle: () => (
						<FadingHeaderTitle
							title={displayName(plant)}
							scrollY={scrollY}
							titleTop={fadingTitle.titleTop}
							titleBottom={fadingTitle.titleBottom}
						/>
					),
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
			<Animated.View
				ref={fadingTitle.containerRef}
				onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
				style={headerStyle}
				// A swipe on the photo or the name scrolls the section underneath
				pointerEvents="box-none"
				// Before the section, so screen readers read the name and the tabs first
				className="absolute inset-x-0 top-0 z-10 gap-4 bg-background px-4 pb-2"
			>
				<View className="flex-row items-center gap-4" pointerEvents="none">
					<PlantPhoto photo={plant.photo} className="size-16 rounded-2xl" />
					<View className="flex-1">
						<Text
							ref={fadingTitle.titleRef}
							onLayout={fadingTitle.onTitleLayout}
							// The nickname and name length limits keep the shrink around 22px
							numberOfLines={plant.nickname ? 1 : 2}
							adjustsFontSizeToFit
							minimumFontScale={0.78}
							accessibilityRole="header"
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
				<View
					className="flex-row gap-2"
					pointerEvents="box-none"
					onLayout={(event) => chipsTop.set(event.nativeEvent.layout.y)}
				>
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
			</Animated.View>
			<PlantSheetScrollProvider value={sheetScroll}>
				{/* Waits for the header height, or the section would show under it then jump */}
				{headerHeight > 0 && <TabSlot />}
			</PlantSheetScrollProvider>
		</Tabs>
	);
}
