import { ActivityIndicator, View } from "react-native";
import Button from "@/components/Button";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

type LoadStateProps = {
	failed: boolean;
	onRetry: () => void;
};

export function LoadState({ failed, onRetry }: LoadStateProps) {
	return (
		<View className="items-center justify-center gap-4 py-8">
			{failed ? (
				<>
					<Text className="text-center text-muted">
						{t("encyclopedia.loadFailed")}
					</Text>
					<Button
						variant="ghost"
						icon="refresh-outline"
						title={t("encyclopedia.retry")}
						onPress={onRetry}
					/>
				</>
			) : (
				<ActivityIndicator className="accent-primary" />
			)}
		</View>
	);
}
