import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import { withUniwind } from "uniwind";
import { Ionicons } from "@/components/ionicons";
import Skeleton from "@/components/Skeleton";
import { photoUri } from "@/features/plants/plantPhoto";

const StyledImage = withUniwind(Image);

type PlantPhotoProps = {
	photo?: string | null;
	url?: string | null;
	className?: string;
	iconSize?: number;
	loading?: boolean;
};

export function PlantPhoto({
	photo,
	url,
	className,
	iconSize = 24,
	loading = false,
}: PlantPhotoProps) {
	const frameClassName = twMerge("overflow-hidden rounded-xl", className);
	const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
	const [failedUrl, setFailedUrl] = useState<string | null>(null);

	const uri = url ?? (photo ? photoUri(photo) : null);

	if (!loading && (!uri || failedUrl === uri)) {
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

	const image = uri && (
		<StyledImage
			source={{ uri }}
			contentFit="cover"
			transition={150}
			className={frameClassName}
			onLoad={() => setLoadedUrl(uri)}
			onError={() => setFailedUrl(uri)}
		/>
	);
	if (!url && !loading) return image;

	// A photo still being found, or coming from the web, takes a moment: its frame pulses meanwhile
	return (
		<View className={frameClassName}>
			{(loading || loadedUrl !== url) && (
				<Skeleton className="absolute inset-0 rounded-none" />
			)}
			{image}
		</View>
	);
}
