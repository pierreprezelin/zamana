import { Link, useIsFocused } from "expo-router";
import { type ReactNode, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Button from "@/components/Button";
import Chip from "@/components/Chip";
import StatusCard from "@/components/StatusCard";
import { useTabBarOffset } from "@/components/TabBar";
import { TabScreen } from "@/components/TabScreen";
import Text from "@/components/Text";
import {
	careName,
	dueLabel,
	plantTasksSummary,
} from "@/features/care/careLabels";
import {
	type CareOverviewEntry,
	type CareOverviewSections,
	careOverview,
} from "@/features/care/careOverview";
import { wasDueWhenDone } from "@/features/care/careSchedule";
import type { CareType, Climate } from "@/features/care/careTypes";
import { CarePlantRow } from "@/features/care/components/CarePlantRow";
import { useCarePreferencesStore } from "@/features/care/useCarePreferencesStore";
import { useCareStore } from "@/features/care/useCareStore";
import { RemindersOffBanner } from "@/features/notifications/components/RemindersOffBanner";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";
import { EmptyGarden } from "@/features/plants/components/EmptyGarden";
import { displayName } from "@/features/plants/plantLabels";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { toISODate } from "@/utils/dates";
import { lowerFirst, t } from "@/utils/i18n";

type SectionProps = {
	title: string;
	entries: CareOverviewEntry[];
	today: string;
	remindersOff: boolean;
	whenEmpty?: ReactNode;
};

function Section({
	title,
	entries,
	today,
	remindersOff,
	whenEmpty,
}: SectionProps) {
	if (!entries.length && !whenEmpty) return null;
	return (
		<View className="gap-3">
			<Text className="font-recoleta text-card-title text-foreground">
				{title}
			</Text>
			{entries.length ? (
				<View className="gap-2 rounded-2xl border border-line bg-surface p-2">
					{entries.map((entry) => (
						<CarePlantRow
							key={entry.care.id}
							entry={entry}
							today={today}
							remindersOff={remindersOff}
						/>
					))}
				</View>
			) : (
				whenEmpty
			)}
		</View>
	);
}

type UpToDateCardProps = {
	type: CareType;
	sections: CareOverviewSections;
	today: string;
	climate: Climate;
};

function UpToDateCard({ type, sections, today, climate }: UpToDateCardProps) {
	const allDone = sections.handledToday.some(
		({ plant, care, handledLog }) =>
			handledLog?.outcome === "done" &&
			wasDueWhenDone(
				care,
				handledLog,
				{ wateringLevel: plant.watering, climate },
				today,
			),
	);
	const next = sections.upcoming.find(({ dueDate }) => dueDate);
	return (
		<StatusCard
			icon="checkmark-outline"
			title={t(
				allDone
					? "careOverview.upToDate.allDone"
					: "careOverview.upToDate.title",
				{ care: careName(type) },
			)}
			description={
				next?.dueDate
					? t("careOverview.next", {
							name: displayName(next.plant),
							due: lowerFirst(dueLabel(next.dueDate, today)),
						})
					: undefined
			}
		/>
	);
}

export default function CareScreen() {
	const plants = usePlantStore((state) => state.plants);
	const cares = useCareStore((state) => state.cares);
	const logs = useCareStore((state) => state.logs);
	const climate = useCarePreferencesStore((state) => state.climate);
	const remindersOff = useRemindersOff().reason !== null;
	const tabBarOffset = useTabBarOffset();
	const [selectedType, setSelectedType] = useState<CareType>();
	// Re-renders on focus, so a screen left open overnight catches up with the date
	useIsFocused();
	const today = toISODate(new Date());

	const { types, sectionsByType, counts } = useMemo(
		() => careOverview({ plants, cares, logs, today, climate }),
		[plants, cares, logs, today, climate],
	);
	const hasPlants = plants.some((plant) => !plant.archivedAt);
	// The selected type falls back to the first one once its last care is stopped
	const type =
		selectedType && types.includes(selectedType) ? selectedType : types[0];
	const sections = type && sectionsByType.get(type);
	const subtitle = !hasPlants
		? t("garden.noPlant")
		: sections
			? plantTasksSummary(
					counts.due,
					counts.done,
					counts.skipped,
					counts.upcoming,
				)
			: t("careOverview.noCare.title");

	return (
		<TabScreen
			title={t("careOverview.title")}
			subtitle={subtitle}
			showSettings
			scrollBottomInset={hasPlants ? tabBarOffset + 16 : undefined}
		>
			{!hasPlants ? (
				<View
					className="flex-1 justify-center"
					style={{ paddingBottom: tabBarOffset }}
				>
					<EmptyGarden />
				</View>
			) : !sections ? (
				<StatusCard
					icon="clipboard-outline"
					title={t("careOverview.noCare.title")}
					description={t("careOverview.noCare.description")}
				>
					<Link href="/garden" asChild>
						<Button
							title={t("careOverview.noCare.seeGarden")}
							size="small"
							className="mt-2 px-4"
						/>
					</Link>
				</StatusCard>
			) : (
				<>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						accessibilityRole="tablist"
						// Scrolls to the screen edges, the chips aligned with the content
						className="-mx-4 grow-0"
						contentContainerClassName="gap-2 px-4"
					>
						{types.map((chipType) => (
							<Chip
								key={chipType}
								label={careName(chipType)}
								selected={chipType === type}
								onPress={() => setSelectedType(chipType)}
							/>
						))}
					</ScrollView>
					<RemindersOffBanner />
					<Section
						title={t("care.todo")}
						entries={sections.due}
						today={today}
						remindersOff={remindersOff}
						whenEmpty={
							<UpToDateCard
								type={type}
								sections={sections}
								today={today}
								climate={climate}
							/>
						}
					/>
					<Section
						title={t("careOverview.handledToday")}
						entries={sections.handledToday}
						today={today}
						remindersOff={remindersOff}
					/>
					<Section
						title={t("care.upcoming")}
						entries={sections.upcoming}
						today={today}
						remindersOff={remindersOff}
					/>
				</>
			)}
		</TabScreen>
	);
}
