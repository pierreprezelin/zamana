import { Link } from "expo-router";
import { View } from "react-native";
import Button from "@/components/Button";
import { Ionicons } from "@/components/ionicons";
import Text from "@/components/Text";

type EmptyGardenProps = {
	// The icon disc must stand out from the background it is shown on
	iconBackgroundClassName?: string;
};

export function EmptyGarden({
	iconBackgroundClassName = "bg-line",
}: EmptyGardenProps) {
	return (
		<View className="items-center gap-6">
			<View
				className={`size-16 items-center justify-center rounded-full ${iconBackgroundClassName}`}
			>
				<Ionicons name="file-tray-outline" size={26} className="text-primary" />
			</View>
			<Text className="w-70 text-center font-recoleta text-xl text-foreground">
				Votre jardin est vide
			</Text>
			<Link href="/plant/new" asChild>
				<Button title="Ajouter ma première plante" icon="add-outline" />
			</Link>
		</View>
	);
}
