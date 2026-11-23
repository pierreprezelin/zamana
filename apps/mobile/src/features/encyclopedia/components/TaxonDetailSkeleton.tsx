import { View } from "react-native";
import { Bone, SkeletonGroup } from "@/components/Skeleton";

// The shape of a plant's detail screen while it loads: photo, names, then the needs
export function TaxonDetailSkeleton() {
	return (
		<SkeletonGroup className="gap-6 px-4 pt-2.5">
			<View className="gap-4">
				<Bone className="aspect-[4/3] w-full rounded-2xl" />
				<View className="gap-2">
					<Bone className="h-8 w-2/3 rounded-md" />
					<Bone className="h-5 w-1/2 rounded-md" />
				</View>
			</View>
			<View className="gap-3">
				<Bone className="h-6 w-1/3 rounded-md" />
				{[0, 1].map((row) => (
					<View key={row} className="flex-row gap-2">
						<Bone className="h-36 flex-1 rounded-2xl" />
						<Bone className="h-36 flex-1 rounded-2xl" />
					</View>
				))}
			</View>
		</SkeletonGroup>
	);
}
