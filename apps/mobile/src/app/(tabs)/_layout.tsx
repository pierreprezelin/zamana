import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { router } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useCSSVariable } from "uniwind";
import { tabs } from "@/constants/tabs";

export default function TabsLayout() {
	const tintColor = useCSSVariable("--color-primary") as string;

	return (
		<NativeTabs
			tintColor={tintColor}
			labelStyle={{ fontFamily: "Outfit-Regular" }}
		>
			{tabs.map(({ name, label, icon }) => (
				<NativeTabs.Trigger key={name} name={name}>
					<NativeTabs.Trigger.Icon
						renderingMode="template"
						src={{
							default: (
								<NativeTabs.Trigger.VectorIcon
									family={Ionicons}
									name={icon.default}
								/>
							),
							selected: (
								<NativeTabs.Trigger.VectorIcon
									family={Ionicons}
									name={icon.selected}
								/>
							),
						}}
					/>
					<NativeTabs.Trigger.Label>{label}</NativeTabs.Trigger.Label>
				</NativeTabs.Trigger>
			))}
			{/* The search role is the only way to get the detached trailing button of iOS 26 */}
			<NativeTabs.Trigger
				name="add"
				role="search"
				disabled
				listeners={{ tabPress: () => router.push("/plant/new") }}
			>
				<NativeTabs.Trigger.Icon
					renderingMode="template"
					src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="add" />}
				/>
				<NativeTabs.Trigger.Label>Ajouter</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
