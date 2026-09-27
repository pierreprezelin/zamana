import { View } from "react-native";
import type {
	ToastConfig,
	ToastConfigParams,
} from "react-native-toast-message";
import { twMerge } from "tailwind-merge";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import { TAB_BAR_SHADOW } from "@/components/TabBar";
import Text from "@/components/Text";

const variants: Record<
	string,
	{ className: string; iconClassName: string; icon: IoniconsIconName }
> = {
	success: {
		className: "border-success bg-success-tint",
		iconClassName: "text-success",
		icon: "checkmark-circle",
	},
	error: {
		className: "border-danger bg-danger-tint",
		iconClassName: "text-danger",
		icon: "alert-circle",
	},
	info: {
		className: "border-info bg-info-tint",
		iconClassName: "text-info",
		icon: "information-circle",
	},
};

const renderToast =
	({ className, iconClassName, icon }: (typeof variants)[string]) =>
	({ text1 }: ToastConfigParams<unknown>) => (
		<View
			className={twMerge(
				"mx-5 flex-row items-center gap-2 self-stretch rounded-[16px] border px-4 py-3",
				className,
			)}
			style={{ boxShadow: TAB_BAR_SHADOW }}
		>
			<Ionicons name={icon} size={20} className={iconClassName} />
			<Text className="flex-1 font-outfit-semibold text-moss">{text1}</Text>
		</View>
	);

export const toastConfig: ToastConfig = Object.fromEntries(
	Object.entries(variants).map(([type, variant]) => [
		type,
		renderToast(variant),
	]),
);
