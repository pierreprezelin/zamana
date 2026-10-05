import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetView,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import type { ComponentProps, ReactNode, Ref } from "react";
import { useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import Text from "@/components/Text";
import palette from "@/constants/palette";

type BottomSheetProps = {
	ref: Ref<BottomSheetModal>;
	title: string;
	children: ReactNode;
	closable?: boolean;
};

const Backdrop = (props: ComponentProps<typeof BottomSheetBackdrop>) => (
	<BottomSheetBackdrop
		{...props}
		appearsOnIndex={0}
		disappearsOnIndex={-1}
		opacity={0.75}
		style={[props.style, { backgroundColor: palette.moss.light }]}
	/>
);

const LockedBackdrop = (props: BottomSheetBackdropProps) => (
	<Backdrop {...props} pressBehavior="none" />
);

export default function BottomSheet({
	ref,
	title,
	children,
	closable = true,
}: BottomSheetProps) {
	const scheme = useColorScheme() === "dark" ? "dark" : "light";
	const { bottom } = useSafeAreaInsets();
	const { dismiss } = useBottomSheetModal();

	return (
		<BottomSheetModal
			ref={ref}
			backdropComponent={closable ? Backdrop : LockedBackdrop}
			enablePanDownToClose={closable}
			handleComponent={null}
			backgroundStyle={{
				backgroundColor: palette.surface[scheme],
				borderRadius: 24,
			}}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
		>
			<BottomSheetView style={{ paddingBottom: Math.max(bottom, 20) }}>
				<View className="gap-5 px-5 pt-5">
					<View className="flex-row items-center justify-between gap-5">
						<Text className="flex-1 font-recoleta text-[24px] leading-[1.25] text-moss mt-1.5">
							{title}
						</Text>
						{closable && (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Fermer"
								pressedOpacity={0.5}
								pressedClassName=""
								hitSlop={8}
								onPress={() => dismiss()}
							>
								<Ionicons name="close" size={24} className="text-moss" />
							</Pressable>
						)}
					</View>
					{children}
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
}
