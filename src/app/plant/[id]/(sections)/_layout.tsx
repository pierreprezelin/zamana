import { useLocalSearchParams } from "expo-router";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { Text } from "react-native";

export default function PlantSectionsLayout() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<Tabs>
			<Text>Photo et nom de la plante #{id}</Text>
			<TabList>
				<TabTrigger name="index" href={`/plant/${id}`}>
					<Text>Informations</Text>
				</TabTrigger>
				<TabTrigger name="care" href={`/plant/${id}/care`}>
					<Text>Entretien</Text>
				</TabTrigger>
				<TabTrigger name="history" href={`/plant/${id}/history`}>
					<Text>Historique</Text>
				</TabTrigger>
			</TabList>
			<TabSlot />
		</Tabs>
	);
}
