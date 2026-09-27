import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen name="index" options={{ title: "Aujourd'hui" }} />
			<Tabs.Screen name="garden" options={{ title: "Jardin" }} />
			<Tabs.Screen name="encyclopedia" options={{ title: "Encyclopédie" }} />
			<Tabs.Screen name="tips" options={{ title: "Conseils" }} />
		</Tabs>
	);
}
