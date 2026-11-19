import { Link } from "expo-router";
import { View } from "react-native";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { plantTasksSummary } from "@/features/care/careLabels";
import { TaskRow } from "@/features/care/components/TaskRow";
import type { TodayGroup } from "@/features/care/todayTasks";
import { PlantPhoto } from "@/features/plants/components/PlantPhoto";
import { displayName } from "@/features/plants/plantLabels";
import { t } from "@/utils/i18n";

type TodayTasksProps = { groups: TodayGroup[]; today: string };

export function TodayTasks({ groups, today }: TodayTasksProps) {
	if (!groups.length) return null;

	return (
		<View className="gap-4">
			<Text className="font-recoleta text-2xl text-foreground">
				{t("care.tasks.title")}
			</Text>
			<View className="gap-2">
				{groups.map(
					({ plant, tasks, pendingCount, doneCount, skippedCount }) => (
						<View
							key={plant.id}
							className="gap-2 rounded-2xl border border-line bg-surface p-2"
						>
							<Link href={`/plant/${plant.id}/care`} asChild>
								<Pressable
									accessibilityRole="button"
									pressedClassName=""
									pressedOpacity={0.75}
									className="flex-row items-center gap-3 p-2"
								>
									<PlantPhoto photo={plant.photo} className="size-12" />
									<View className="flex-1">
										<Text
											numberOfLines={1}
											className="font-outfit-semibold text-base text-foreground"
										>
											{displayName(plant)}
										</Text>
										<Text className="text-xs text-muted">
											{plantTasksSummary(pendingCount, doneCount, skippedCount)}
										</Text>
									</View>
								</Pressable>
							</Link>
							{tasks.map((task) => (
								<TaskRow
									key={task.care.id}
									task={task}
									plant={plant}
									today={today}
								/>
							))}
						</View>
					),
				)}
			</View>
		</View>
	);
}
