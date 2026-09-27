import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { View } from "react-native";
import {
	TAB_BAR_SHADOW,
	TabBarAddButton,
	TabBarIndicator,
	TabBarItem,
	useTabBarBottom,
	useTabBarIndicator,
} from "@/components/TabBar";
import { tabs } from "@/constants/tabs";

export default function TabsLayout() {
	const bottom = useTabBarBottom();
	const { moveIndicatorTo, indicatorStyle, indicatorTravel } =
		useTabBarIndicator();

	return (
		<Tabs style={{ flex: 1 }}>
			<TabSlot />
			{/* asChild so NativeWind styles a View rendered here: className is ignored on expo-router's own View */}
			<TabList asChild>
				<View
					className="absolute left-[21px] right-[81px] flex-row rounded-full bg-surface p-[3px]"
					style={{ bottom, boxShadow: TAB_BAR_SHADOW }}
				>
					<TabBarIndicator style={indicatorStyle} />
					{tabs.map(({ name, href, label, icon }) => (
						<TabTrigger key={name} name={name} href={href} asChild>
							<TabBarItem
								label={label}
								icon={icon}
								onFocusedLayout={moveIndicatorTo}
								indicatorTravel={indicatorTravel}
							/>
						</TabTrigger>
					))}
				</View>
			</TabList>
			<TabBarAddButton />
		</Tabs>
	);
}
