import { router } from "expo-router";
import { MessageScreen } from "@/components/MessageScreen";
import { t } from "@/utils/i18n";

export default function NotFoundScreen() {
	return (
		<MessageScreen
			title={t("common.pageNotFound")}
			text={t("common.pageNotFoundText")}
			action={{
				title: t("common.backHome"),
				icon: "home-outline",
				onPress: () => router.replace("/"),
			}}
		/>
	);
}
