import type { IoniconsIconName } from "@/components/ionicons";
import type { Option } from "@/components/OptionList";
import type {
	AgeUnit,
	ArchiveReason,
	FloweringType,
	Lifespan,
	PlantLocation,
	PlantOrigin,
	PlantType,
	Season,
} from "@/features/plants/plantSchema";

const toOptions = <T extends string>(labels: Record<T, string>): Option<T>[] =>
	(Object.keys(labels) as T[]).map((value) => ({
		value,
		label: labels[value],
	}));

export const plantTypeLabels: Record<PlantType, string> = {
	citrus: "Agrume",
	fruitTree: "Arbre fruitier",
	shrub: "Arbuste",
	herb: "Aromatique",
	bonsai: "Bonsaï",
	cactus: "Cactus",
	carnivorous: "Carnivore",
	fern: "Fougère",
	climber: "Grimpante",
	orchid: "Orchidée",
	palm: "Palmier",
	succulent: "Succulente",
};

export const originLabels: Record<PlantOrigin, string> = {
	cutting: "Bouture",
	gift: "Cadeau",
	swap: "Échange",
	store: "Magasin",
	rescued: "Récupérée",
	seed: "Semis",
};

export const locationLabels: Record<PlantLocation, string> = {
	office: "Bureau",
	bedroom: "Chambre",
	kitchen: "Cuisine",
	entrance: "Entrée",
	bathroom: "Salle de bain",
	livingRoom: "Salon",
	veranda: "Véranda",
};

export const seasonLabels: Record<Season, string> = {
	spring: "Printemps",
	summer: "Été",
	autumn: "Automne",
	winter: "Hiver",
};

export const floweringTypeLabels: Record<FloweringType, string> = {
	monocarpic: "Monocarpique",
	polycarpic: "Polycarpique",
};

export const lifespanLabels: Record<Lifespan, string> = {
	annual: "Annuelle",
	biennial: "Bisannuelle",
	perennial: "Vivace",
};

export const ageUnitLabels: Record<AgeUnit, string> = {
	day: "Jours",
	month: "Mois",
	year: "Ans",
};

export const archiveReasonLabels: Record<ArchiveReason, string> = {
	dead: "Elle est morte",
	given: "Je l’ai donnée",
	lost: "Je l’ai perdue",
	sold: "Je l’ai vendue",
	other: "Autre raison",
};

export const plantTypeOptions = toOptions(plantTypeLabels);
export const originOptions = toOptions(originLabels);
export const locationOptions = toOptions(locationLabels);
export const seasonOptions = toOptions(seasonLabels);
export const floweringTypeOptions = toOptions(floweringTypeLabels);
export const lifespanOptions = toOptions(lifespanLabels);
export const ageUnitOptions = toOptions(ageUnitLabels);
export const archiveReasonOptions = toOptions(archiveReasonLabels);

export type NeedKey = "light" | "watering" | "temperature" | "humidity";

type Need = {
	key: NeedKey;
	label: string;
	icon: IoniconsIconName;
	// Short labels fit the form selector, long ones the information tiles
	levels: [string, string, string];
	details?: [string, string, string];
	helper?: string;
};

export const needs: Need[] = [
	{
		key: "light",
		label: "Lumière",
		icon: "sunny-outline",
		levels: ["Faible", "Indirecte", "Directe"],
	},
	{
		key: "watering",
		label: "Arrosage",
		icon: "water-outline",
		levels: ["2-3 jours", "1-2 sem.", "1 mois"],
		details: [
			"Tous les 2-3 jours",
			"Toutes les 1-2 semaines",
			"Une fois par mois",
		],
	},
	{
		key: "temperature",
		label: "Température",
		icon: "thermometer-outline",
		levels: ["Fraîche", "Tempérée", "Chaude"],
		helper: "Fraîche : 10-15 °C · Tempérée : 15-24 °C · Chaude : 24 °C et +",
	},
	{
		key: "humidity",
		label: "Humidité",
		icon: "rainy-outline",
		levels: ["Peu", "Normale", "Beaucoup"],
	},
];

export type Help = {
	title: string;
	items: { label: string; text: string }[];
};

export const floweringTypeHelp: Help = {
	title: "Type de floraison",
	items: [
		{
			label: "Monocarpique",
			text: "Fleurit une seule fois puis meurt, parfois après de longues années (agave, broméliacée).",
		},
		{
			label: "Polycarpique",
			text: "Fleurit plusieurs fois au cours de sa vie (orchidée, rosier).",
		},
	],
};

export const lifespanHelp: Help = {
	title: "Durée de vie",
	items: [
		{
			label: "Annuelle",
			text: "Accomplit tout son cycle en une seule saison.",
		},
		{
			label: "Bisannuelle",
			text: "Vit deux ans : des feuilles la première année, des fleurs la seconde.",
		},
		{
			label: "Vivace",
			text: "Vit plusieurs années. Si elle est aussi monocarpique, elle peut ne fleurir qu’une fois au bout de 10, 20 ou 30 ans avant de mourir.",
		},
	],
};
