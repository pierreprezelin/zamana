import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Below the ScrollView, inside the KeyboardAvoidingView so that it rises above the keyboard
export default function StickyActionBar({ children }: { children: ReactNode }) {
	const { bottom } = useSafeAreaInsets();

	return (
		<View
			className="gap-2 bg-background px-4 pt-2.5"
			style={{ paddingBottom: bottom }}
		>
			{children}
		</View>
	);
}
