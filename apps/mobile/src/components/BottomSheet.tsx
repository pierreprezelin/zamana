import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetView,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import type { ComponentProps, ReactNode, Ref } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import { t } from "@/utils/i18n";

type BottomSheetProps = {
	ref: Ref<BottomSheetModal>;
	title: string;
	children?: ReactNode;
	actions?: ReactNode;
	closable?: boolean;
};

const Backdrop = (props: ComponentProps<typeof BottomSheetBackdrop>) => {
	const backgroundColor = useCSSVariable("--color-backdrop") as string;

	return (
		<BottomSheetBackdrop
			{...props}
			appearsOnIndex={0}
			disappearsOnIndex={-1}
			opacity={0.75}
			style={[props.style, { backgroundColor }]}
		/>
	);
};

const LockedBackdrop = (props: BottomSheetBackdropProps) => (
	<Backdrop {...props} pressBehavior="none" />
);

export default function BottomSheet({
	ref,
	title,
	children,
	actions,
	closable = true,
}: BottomSheetProps) {
	const surfaceColor = useCSSVariable("--color-surface") as string;
	const handleColor = useCSSVariable("--color-border") as string;
	const { bottom } = useSafeAreaInsets();
	const { dismiss } = useBottomSheetModal();

	return (
		<BottomSheetModal
			ref={ref}
			// Keeps the sheet below mounted when another one opens from it, or the new one unmounts with its parent
			stackBehavior="push"
			backdropComponent={closable ? Backdrop : LockedBackdrop}
			enablePanDownToClose={closable}
			handleComponent={closable ? undefined : null}
			handleIndicatorStyle={{ backgroundColor: handleColor }}
			backgroundStyle={{
				backgroundColor: surfaceColor,
				borderRadius: 24,
			}}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
		>
			<BottomSheetView style={{ paddingBottom: bottom }}>
				<View className={`gap-4 p-4 ${closable ? "pt-0" : ""}`}>
					<View className="flex-row items-center justify-between gap-4">
						<Text className="flex-1 font-recoleta text-2xl leading-[1.25] text-foreground mt-1.5">
							{title}
						</Text>
						{closable && (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel={t("common.close")}
								pressedOpacity={0.5}
								pressedClassName=""
								hitSlop={10}
								onPress={() => dismiss()}
							>
								<Ionicons name="close" size={24} className="text-foreground" />
							</Pressable>
						)}
					</View>
					{children}
				</View>
				{actions && <View className="gap-2 px-4">{actions}</View>}
			</BottomSheetView>
		</BottomSheetModal>
	);
}
