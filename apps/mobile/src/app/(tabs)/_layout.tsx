import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { NativeTabs } from "expo-router/native-tabs";
import { useCSSVariable } from "uniwind";
import { tabs } from "@/constants/tabs";
import { selectionFeedback } from "@/utils/haptics";

export default function TabsLayout() {
	const tintColor = useCSSVariable("--color-primary") as string;

	return (
		<NativeTabs
			tintColor={tintColor}
			labelStyle={{ fontFamily: "Outfit-Regular" }}
		>
			{tabs.map(({ name, label, icon }) => (
				<NativeTabs.Trigger
					key={name}
					name={name}
					listeners={{ tabPress: () => selectionFeedback() }}
				>
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
		</NativeTabs>
	);
}
