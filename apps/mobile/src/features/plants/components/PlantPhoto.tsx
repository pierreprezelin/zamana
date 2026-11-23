import { Image } from "expo-image";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { withUniwind } from "uniwind";
import { Ionicons } from "@/components/ionicons";
import { photoUri } from "@/features/plants/plantPhoto";

const StyledImage = withUniwind(Image);

type PlantPhotoProps = {
	photo?: string | null;
	url?: string | null;
	className?: string;
	iconSize?: number;
};

export function PlantPhoto({
	photo,
	url,
	className,
	iconSize = 24,
}: PlantPhotoProps) {
	const frameClassName = twMerge("overflow-hidden rounded-xl", className);

	const uri = url ?? (photo ? photoUri(photo) : null);

	if (!uri) {
		return (
			<View
				className={twMerge(
					frameClassName,
					"items-center justify-center bg-primary-tint",
				)}
			>
				<Ionicons
					name="leaf-outline"
					size={iconSize}
					className="text-primary"
				/>
			</View>
		);
	}

	return (
		<StyledImage
			source={{ uri }}
			contentFit="cover"
			transition={150}
			className={frameClassName}
		/>
	);
}
