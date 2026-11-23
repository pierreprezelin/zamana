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

// An open photo of each plant potted at home, picked among the observations: the default
// iNaturalist photos often show it in the wild, or are under a closed licence
const PICKED_PHOTOS: Record<number, PickedPhoto> = {
	122521: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/63451902/medium.jpeg",
		attribution:
			"(c) Jacqui Geux, some rights reserved (CC BY), uploaded by Jacqui Geux",
	}, // Monstera deliciosa
	367277: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/99330766/medium.jpg",
		attribution: "(c) Andrew GottWorth, some rights reserved (CC BY)",
	}, // Zamioculcas zamiifolia
	126507: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/750555474/medium.jpg",
		attribution: "no rights reserved",
	}, // Ficus elastica
	69223: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/425233172/medium.jpeg",
		attribution: "(c) Noland Aull, some rights reserved (CC BY)",
	}, // Epipremnum aureum
	67710: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/125894288/medium.jpeg",
		attribution: "(c) Suvarna Parbhoo Mohan, some rights reserved (CC BY-SA)",
	}, // Sansevieria trifasciata
	284040: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/529273631/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Spathiphyllum wallisii
	140477: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/368194406/medium.jpeg",
		attribution:
			"(c) Tom Heijnen, some rights reserved (CC BY), uploaded by Tom Heijnen",
	}, // Phalaenopsis
	322492: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/586015907/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Chlorophytum comosum
	126882: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/427728220/medium.jpeg",
		attribution: "(c) Nico Hernandez, some rights reserved (CC BY)",
	}, // Aloe vera
	201458: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/181047798/medium.jpg",
		attribution: "(c) Marc Riera, some rights reserved (CC BY)",
	}, // Ficus lyrata
	866988: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/181106495/medium.jpeg",
		attribution: "(c) Wesley Webb, some rights reserved (CC BY)",
	}, // Goeppertia orbifolia
	125439: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/626650128/medium.jpg",
		attribution: "no rights reserved",
	}, // Pilea peperomioides
	49143: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/52228357/medium.jpg",
		attribution: "(c) Luis F. Ramírez, some rights reserved (CC BY)",
	}, // Strelitzia reginae
	126509: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/48122652/medium.jpeg",
		attribution: "(c) Leon Perrie, some rights reserved (CC BY)",
	}, // Dracaena reflexa angustifolia
	126515: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/587074336/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Dracaena fragrans
	158118: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/718943672/medium.jpg",
		attribution: "no rights reserved",
	}, // Aglaonema commutatum
	120490: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/217171088/medium.jpeg",
		attribution: "(c) Sarah Abbate, some rights reserved (CC BY)",
	}, // Philodendron hederaceum
	166493: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/240362813/medium.jpg",
		attribution: "(c) L.J. Lamera, some rights reserved (CC BY)",
	}, // Peperomia obtusifolia
	366346: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/333972029/medium.jpg",
		attribution: "(c) Oleksandr Shynder, some rights reserved (CC BY)",
	}, // Maranta leuconeura
	327855: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/422923046/medium.jpeg",
		attribution: "(c) Kaden Slone, some rights reserved (CC BY)",
	}, // Fittonia albivenis
	169883: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/251052804/medium.jpg",
		attribution: "(c) jlsnaddon, some rights reserved (CC BY)",
	}, // Tradescantia zebrina
	125396: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/652196518/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Aspidistra elatior
	84356: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/81237053/medium.jpeg",
		attribution: "(c) Monics Paredes, some rights reserved (CC BY)",
	}, // Asplenium nidus
	130866: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/59374393/medium.jpeg",
		attribution: "(c) Cassian, some rights reserved (CC BY)",
	}, // Nephrolepis exaltata
	276548: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/719904531/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Chrysalidocarpus lutescens
	135400: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/421953572/medium.jpeg",
		attribution: "no rights reserved",
	}, // Howea forsteriana
	283400: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/444331605/medium.jpeg",
		attribution: "no rights reserved",
	}, // Chamaedorea elegans
	206192: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/356524627/medium.jpeg",
		attribution: "(c) Татьяна Максимова, some rights reserved (CC BY)",
	}, // Beaucarnea recurvata
	206749: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/40916523/medium.jpg",
		attribution: "(c) Israel Castorena Lemus, some rights reserved (CC BY-SA)",
	}, // Echeveria elegans
	76465: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/593116859/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Crassula ovata
	276072: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/244258843/medium.jpg",
		attribution: "(c) Paulo Galvão, some rights reserved (CC BY)",
	}, // Sedum morganianum
	164326: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/451489425/medium.jpeg",
		attribution: "(c) Noland Aull, some rights reserved (CC BY)",
	}, // Kalanchoe blossfeldiana
	78267: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/11888385/medium.jpg",
		attribution:
			"(c) Frank Sengpiel, some rights reserved (CC BY), uploaded by Frank Sengpiel",
	}, // Opuntia microdasys
	273594: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/178322802/medium.jpg",
		attribution: "(c) Andrew Sebastian, some rights reserved (CC BY)",
	}, // Mammillaria elongata
	869962: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/222544577/medium.jpeg",
		attribution: "(c) Mandy Hackney, some rights reserved (CC BY)",
	}, // Kroenleinia grusonii
	51223: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/539694004/medium.jpg",
		attribution: "(c) Bruno Leão, some rights reserved (CC BY)",
	}, // Schlumbergera truncata
	322318: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/150247403/medium.jpeg",
		attribution: "(c) francis__, some rights reserved (CC BY)",
	}, // Euphorbia trigona
	479482: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/225436321/medium.jpeg",
		attribution: "no rights reserved",
	}, // Gasteria carinata
	186097: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/344396366/medium.jpg",
		attribution: "(c) Dornenwolf, some rights reserved (CC BY)",
	}, // Lithops
	69235: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/171730592/medium.jpeg",
		attribution: "(c) ELOYJIMENEZ13, some rights reserved (CC BY)",
	}, // Anthurium andraeanum
	129523: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/165589748/medium.jpeg",
		attribution: "no rights reserved, uploaded by 葉子",
	}, // Hoya carnosa
	927983: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/715819054/medium.jpg",
		attribution: "no rights reserved",
	}, // Streptocarpus ionanthus
	341141: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/447701421/medium.jpg",
		attribution: "no rights reserved",
	}, // Cyclamen persicum
	327898: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/175908623/medium.jpeg",
		attribution: "no rights reserved",
	}, // Begonia rex
	1628098: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/439083067/medium.jpg",
		attribution: "no rights reserved",
	}, // Hibiscus rosa-sinensis
	67756: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/464987572/medium.jpg",
		attribution: "(c) Maja Dumat, some rights reserved (CC BY)",
	}, // Dendrobium nobile
	331124: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/604228157/medium.jpg",
		attribution: "no rights reserved",
	}, // Citrus limon
	210990: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/48919348/medium.jpeg",
		attribution: "(c) Ong Jyh Seng, some rights reserved (CC BY-SA)",
	}, // Gardenia jasminoides
	342641: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/284719415/medium.jpeg",
		attribution: "(c) Robert Guralnick, some rights reserved (CC BY)",
	}, // Jasminum polyanthum
	276734: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/659292503/medium.jpg",
		attribution: "no rights reserved",
	}, // Guzmania lingulata
	52666: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/108567955/medium.jpg",
		attribution: "(c) David Hill, some rights reserved (CC BY)",
	}, // Dionaea muscipula
	61398: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/74353484/medium.jpg",
		attribution: "no rights reserved",
	}, // Ocimum basilicum
	62652: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/473892303/medium.jpeg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Mentha spicata
	636795: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/523493/medium.jpg",
		attribution: "(c) Tom, some rights reserved (CC BY-SA)",
	}, // Salvia rosmarinus
	50996: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/171219965/medium.jpeg",
		attribution: "(c) Matt B, some rights reserved (CC BY)",
	}, // Ficus benjamina
	143208: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/69710938/medium.jpeg",
		attribution: "(c) Jeremy Gilmore, some rights reserved (CC BY)",
	}, // Syngonium podophyllum
	418734: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/245374883/medium.jpeg",
		attribution: "(c) Francis Pérez, some rights reserved (CC BY)",
	}, // Ceropegia woodii
	943005: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/373328032/medium.jpeg",
		attribution: "(c) naturewatchwidow, some rights reserved (CC BY)",
	}, // Curio rowleyanus
	291380: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/443513194/medium.jpg",
		attribution: "(c) Ong Jyh Seng, some rights reserved (CC BY)",
	}, // Ficus retusa
	54982: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/456549983/medium.jpg",
		attribution: "(c) Jon Mortin, some rights reserved (CC BY)",
	}, // Ficus microcarpa
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
