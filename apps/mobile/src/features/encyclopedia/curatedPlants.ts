import type {
	FloweringType,
	Lifespan,
	PlantType,
	Season,
} from "@/features/plants/plantSchema";

type Level = 1 | 2 | 3;

export type CuratedPlant = {
	taxonId: number;
	type: PlantType | null;
	light: Level;
	watering: Level;
	temperature: Level;
	humidity: Level;
	toxic: boolean;
	outdoor: boolean;
	floweringSeasons: Season[];
	floweringType: FloweringType | null;
	lifespan: Lifespan;
};

type CareDetails = Partial<
	Pick<
		CuratedPlant,
		"toxic" | "outdoor" | "floweringSeasons" | "floweringType" | "lifespan"
	>
>;

const curated = (
	taxonId: number,
	type: PlantType | null,
	[light, watering, temperature, humidity]: [Level, Level, Level, Level],
	{
		toxic = false,
		outdoor = false,
		floweringSeasons = [],
		floweringType = floweringSeasons.length > 0 ? "polycarpic" : null,
		lifespan = "perennial",
	}: CareDetails = {},
): CuratedPlant => ({
	taxonId,
	type,
	light,
	watering,
	temperature,
	humidity,
	toxic,
	outdoor,
	floweringSeasons,
	floweringType,
	lifespan,
});

// The most popular first. Needs are [light, watering, temperature, humidity], on the form levels:
// watering 1 is every 2-3 days, 3 every 4-6 weeks
export const CURATED_PLANTS: CuratedPlant[] = [
	curated(122521, "foliage", [2, 2, 2, 2], { toxic: true }), // Monstera deliciosa
	curated(367277, "foliage", [1, 3, 2, 1], { toxic: true }), // Zamioculcas zamiifolia
	curated(126507, "foliage", [2, 2, 2, 2], { toxic: true }), // Ficus elastica
	curated(69223, "climber", [1, 2, 2, 2], { toxic: true }), // Epipremnum aureum
	curated(67710, "succulent", [1, 3, 2, 1], { toxic: true }), // Sansevieria trifasciata
	curated(284040, "foliage", [1, 2, 2, 3], {
		toxic: true,
		floweringSeasons: ["spring", "summer"],
	}), // Spathiphyllum wallisii
	curated(140477, "orchid", [2, 2, 2, 2], {
		floweringSeasons: ["winter", "spring"],
	}), // Phalaenopsis
	curated(322492, "foliage", [2, 2, 2, 2]), // Chlorophytum comosum
	curated(126882, "succulent", [3, 3, 2, 1], { toxic: true }), // Aloe vera
	curated(201458, "foliage", [3, 2, 2, 2], { toxic: true }), // Ficus lyrata
	curated(866988, "foliage", [2, 2, 2, 3]), // Goeppertia orbifolia (Calathea)
	curated(125439, "foliage", [2, 2, 2, 2]), // Pilea peperomioides
	curated(49143, "foliage", [3, 2, 2, 2], { toxic: true }), // Strelitzia reginae
	curated(126509, "foliage", [2, 2, 2, 1], { toxic: true }), // Dracaena reflexa angustifolia (marginata)
	curated(126515, "foliage", [1, 2, 2, 2], { toxic: true }), // Dracaena fragrans
	curated(158118, "foliage", [1, 2, 2, 2], { toxic: true }), // Aglaonema commutatum
	curated(120490, "climber", [1, 2, 2, 2], { toxic: true }), // Philodendron hederaceum
	curated(166493, "foliage", [2, 2, 2, 2]), // Peperomia obtusifolia
	curated(366346, "foliage", [2, 2, 2, 3]), // Maranta leuconeura
	curated(327855, "foliage", [2, 1, 2, 3]), // Fittonia albivenis
	curated(169883, "foliage", [2, 2, 2, 2], { toxic: true }), // Tradescantia zebrina
	curated(125396, "foliage", [1, 2, 1, 1]), // Aspidistra elatior
	curated(84356, "fern", [1, 2, 2, 3]), // Asplenium nidus
	curated(130866, "fern", [2, 1, 2, 3]), // Nephrolepis exaltata
	curated(276548, "palm", [2, 2, 2, 2]), // Chrysalidocarpus lutescens (Areca)
	curated(135400, "palm", [1, 2, 2, 2]), // Howea forsteriana (Kentia)
	curated(283400, "palm", [1, 2, 2, 2]), // Chamaedorea elegans
	curated(206192, "succulent", [3, 3, 2, 1]), // Beaucarnea recurvata
	curated(206749, "succulent", [3, 3, 2, 1], {
		floweringSeasons: ["spring", "summer"],
	}), // Echeveria elegans
	curated(76465, "succulent", [3, 3, 2, 1], { toxic: true }), // Crassula ovata
	curated(276072, "succulent", [3, 3, 2, 1]), // Sedum morganianum
	curated(164326, "succulent", [3, 3, 2, 1], {
		toxic: true,
		floweringSeasons: ["winter", "spring"],
	}), // Kalanchoe blossfeldiana
	curated(78267, "cactus", [3, 3, 2, 1]), // Opuntia microdasys
	curated(273594, "cactus", [3, 3, 2, 1], { floweringSeasons: ["spring"] }), // Mammillaria elongata
	curated(869962, "cactus", [3, 3, 2, 1]), // Kroenleinia grusonii
	curated(51223, "cactus", [2, 2, 1, 2], { floweringSeasons: ["winter"] }), // Schlumbergera truncata
	curated(322318, "succulent", [3, 3, 2, 1], { toxic: true }), // Euphorbia trigona
	curated(479482, "succulent", [2, 3, 2, 1]), // Gasteria carinata
	curated(186097, "succulent", [3, 3, 2, 1], { floweringSeasons: ["autumn"] }), // Lithops
	curated(69235, null, [2, 2, 3, 3], {
		toxic: true,
		floweringSeasons: ["spring", "summer", "autumn"],
	}), // Anthurium andraeanum
	curated(129523, "climber", [2, 2, 2, 2], { floweringSeasons: ["summer"] }), // Hoya carnosa
	curated(927983, null, [2, 2, 2, 2], {
		floweringSeasons: ["spring", "summer", "autumn", "winter"],
	}), // Streptocarpus ionanthus (Saintpaulia)
	curated(341141, null, [2, 2, 1, 2], {
		toxic: true,
		floweringSeasons: ["autumn", "winter"],
	}), // Cyclamen persicum
	curated(327898, "foliage", [2, 2, 2, 3], { toxic: true }), // Begonia rex
	curated(1628098, "shrub", [3, 1, 2, 2], {
		floweringSeasons: ["spring", "summer"],
	}), // Hibiscus rosa-sinensis
	curated(67756, "orchid", [3, 2, 2, 2], {
		floweringSeasons: ["winter", "spring"],
	}), // Dendrobium nobile
	curated(331124, "citrus", [3, 2, 2, 2], {
		toxic: true,
		floweringSeasons: ["spring"],
	}), // Citrus limon
	curated(210990, "shrub", [2, 2, 2, 3], {
		toxic: true,
		floweringSeasons: ["summer"],
	}), // Gardenia jasminoides
	curated(342641, "climber", [3, 2, 1, 2], {
		floweringSeasons: ["winter", "spring"],
	}), // Jasminum polyanthum
	curated(276734, null, [2, 2, 2, 3], {
		floweringSeasons: ["summer"],
		floweringType: "monocarpic",
	}), // Guzmania lingulata
	curated(52666, "carnivorous", [3, 1, 2, 3], {
		floweringSeasons: ["spring"],
	}), // Dionaea muscipula
	curated(61398, "herb", [3, 1, 3, 2], {
		floweringSeasons: ["summer"],
		floweringType: "monocarpic",
		lifespan: "annual",
	}), // Ocimum basilicum
	curated(62652, "herb", [2, 1, 2, 2], {
		toxic: true,
		outdoor: true,
		floweringSeasons: ["summer"],
	}), // Mentha spicata
	curated(636795, "herb", [3, 2, 1, 1], {
		outdoor: true,
		floweringSeasons: ["spring"],
	}), // Salvia rosmarinus
	curated(50996, "foliage", [2, 2, 2, 2], { toxic: true }), // Ficus benjamina
	curated(143208, "climber", [2, 2, 2, 2], { toxic: true }), // Syngonium podophyllum
	curated(418734, "climber", [2, 2, 2, 1], { floweringSeasons: ["summer"] }), // Ceropegia woodii
	curated(943005, "succulent", [2, 2, 2, 1], {
		toxic: true,
		floweringSeasons: ["spring"],
	}), // Curio rowleyanus
	curated(291380, "bonsai", [3, 2, 2, 2], { toxic: true }), // Ficus retusa
	curated(54982, "bonsai", [3, 2, 2, 2], { toxic: true }), // Ficus microcarpa
];

type PickedPhoto = { url: string; attribution: string };

// The plants whose iNaturalist photos are all under a closed licence: an open one picked among the observations
const PICKED_PHOTOS: Record<number, PickedPhoto> = {
	67710: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/698006029/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Sansevieria trifasciata
	201458: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/440618779/medium.jpg",
		attribution: "(c) Eric Knight, some rights reserved (CC BY)",
	}, // Ficus lyrata
	125439: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/655954538/medium.jpg",
		attribution: "no rights reserved",
	}, // Pilea peperomioides
	126509: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/41265352/medium.jpeg",
		attribution: "(c) jmmaes, some rights reserved (CC BY-SA)",
	}, // Dracaena reflexa angustifolia
	166493: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/240362813/medium.jpg",
		attribution: "(c) L.J. Lamera, some rights reserved (CC BY)",
	}, // Peperomia obtusifolia
	366346: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/341601373/medium.jpg",
		attribution: "no rights reserved",
	}, // Maranta leuconeura
	327855: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/280792406/medium.jpg",
		attribution: "(c) Amanda Fisher, some rights reserved (CC BY)",
	}, // Fittonia albivenis
	125396: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/652196518/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Aspidistra elatior
	206192: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/333100621/medium.jpg",
		attribution: "(c) Dave Richardson, some rights reserved (CC BY)",
	}, // Beaucarnea recurvata
	206749: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/678962633/medium.jpg",
		attribution: "no rights reserved",
	}, // Echeveria elegans
	76465: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/161230628/medium.jpeg",
		attribution: "(c) Christiaan Viljoen, some rights reserved (CC BY)",
	}, // Crassula ovata
	276072: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/550984218/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Sedum morganianum
	164326: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/258127638/medium.jpg",
		attribution: "(c) birdzilla, some rights reserved (CC BY)",
	}, // Kalanchoe blossfeldiana
	869962: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/222544577/medium.jpeg",
		attribution: "(c) Mandy Hackney, some rights reserved (CC BY)",
	}, // Kroenleinia grusonii
	479482: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/280695090/medium.jpeg",
		attribution: "(c) Christiaan Viljoen, some rights reserved (CC BY)",
	}, // Gasteria carinata
	69235: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/358222525/medium.jpeg",
		attribution: "(c) agujaceratops, some rights reserved (CC BY)",
	}, // Anthurium andraeanum
	927983: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/1365518/medium.JPG",
		attribution: "(c) Carrie Seltzer, some rights reserved (CC BY)",
	}, // Streptocarpus ionanthus
	331124: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/167595900/medium.jpeg",
		attribution: "(c) Gianni Del Bufalo bygdb, some rights reserved (CC BY)",
	}, // Citrus × limon
	636795: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/619227076/medium.jpg",
		attribution: "(c) ahabo, some rights reserved (CC BY)",
	}, // Salvia rosmarinus
	418734: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/577519583/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Ceropegia woodii
	291380: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/132302577/medium.jpeg",
		attribution: "(c) Ismael Olea, some rights reserved (CC BY)",
	}, // Ficus retusa
};

export const pickedPhoto = (taxonId: number): PickedPhoto | undefined =>
	PICKED_PHOTOS[taxonId];

export const CATEGORIES = [
	"popular",
	"nonToxic",
	"lowLight",
	"lowWatering",
	"flowering",
	"succulents",
] as const;

export type Category = (typeof CATEGORIES)[number];

const matchesCategory: Record<Category, (plant: CuratedPlant) => boolean> = {
	popular: () => true,
	nonToxic: (plant) => !plant.toxic,
	lowLight: (plant) => plant.light === 1,
	lowWatering: (plant) => plant.watering === 3,
	flowering: (plant) => plant.floweringSeasons.length > 0,
	succulents: (plant) => plant.type === "succulent" || plant.type === "cactus",
};

const TAB_SIZE = 10;

export const categoryTaxonIds = (category: Category) =>
	CURATED_PLANTS.filter(matchesCategory[category])
		.slice(0, TAB_SIZE)
		.map((plant) => plant.taxonId);

export const curatedPlant = (taxonId: number) =>
	CURATED_PLANTS.find((plant) => plant.taxonId === taxonId);
