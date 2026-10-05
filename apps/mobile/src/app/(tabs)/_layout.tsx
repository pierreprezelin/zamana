import { router } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";
import { Ionicons } from "@/components/ionicons";
import palette from "@/constants/palette";
import { tabs } from "@/constants/tabs";

export default function TabsLayout() {
	return (
		<NativeTabs
			tintColor={DynamicColorIOS(palette.forest)}
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
