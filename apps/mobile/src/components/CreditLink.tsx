import { Linking } from "react-native";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";

type CreditLinkProps = {
	label: string;
	url: string;
	textClassName?: string;
	numberOfLines?: number;
};

export default function CreditLink({
	label,
	url,
	textClassName = "text-muted",
	numberOfLines,
}: CreditLinkProps) {
	return (
		<Pressable
			accessibilityRole="link"
			pressedClassName=""
			pressedOpacity={0.5}
			hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
			onPress={() => Linking.openURL(url)}
		>
			<Text
				numberOfLines={numberOfLines}
				className={`text-xs underline ${textClassName}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}
