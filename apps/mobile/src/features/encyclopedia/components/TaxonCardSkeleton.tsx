import { View } from "react-native";
import { Bone, SkeletonGroup } from "@/components/Skeleton";

// The shape of a TaxonCard while results load
function TaxonCardSkeleton() {
	return (
		<View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-4">
			<Bone className="size-16 rounded-2xl" />
			<View className="flex-1 gap-2">
				<Bone className="h-5 w-2/3 rounded-md" />
				<Bone className="h-4 w-1/2 rounded-md" />
			</View>
			<Bone className="size-9" />
		</View>
	);
}

export function TaxonListSkeleton({ count }: { count: number }) {
	return (
		<SkeletonGroup className="gap-2">
			{Array.from({ length: count }, (_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: identical placeholders, never reordered
				<TaxonCardSkeleton key={index} />
			))}
		</SkeletonGroup>
	);
}
