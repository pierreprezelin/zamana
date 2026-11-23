import type {
	FloweringType,
	Lifespan,
	PlantType,
	Season,
} from "@/features/plants/plantSchema";
import { locale } from "@/utils/i18n";
import { normalizeForSearch } from "@/utils/search";

type Level = 1 | 2 | 3;

type UsageNames = { fr: string; en: string };

export type CuratedPlant = {
	taxonId: number;
	scientificName: string;
	names: UsageNames;
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
	scientificName: string,
	names: UsageNames,
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
	scientificName,
	names,
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
	curated(
		122521,
		"Monstera deliciosa",
		{ fr: "Monstera", en: "Monstera" },
		"foliage",
		[2, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		367277,
		"Zamioculcas zamiifolia",
		{ fr: "Zamioculcas", en: "ZZ plant" },
		"foliage",
		[1, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		126507,
		"Ficus elastica",
		{ fr: "Caoutchouc", en: "Rubber plant" },
		"foliage",
		[2, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		69223,
		"Epipremnum aureum",
		{ fr: "Pothos", en: "Pothos" },
		"climber",
		[1, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		67710,
		"Sansevieria trifasciata",
		{ fr: "Langue de belle-mère", en: "Snake plant" },
		"succulent",
		[1, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		284040,
		"Spathiphyllum wallisii",
		{ fr: "Spathiphyllum", en: "Peace lily" },
		"foliage",
		[1, 2, 2, 3],
		{
			toxic: true,
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		140477,
		"Phalaenopsis",
		{ fr: "Orchidée papillon", en: "Moth orchid" },
		"orchid",
		[2, 2, 2, 2],
		{
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		322492,
		"Chlorophytum comosum",
		{ fr: "Plante araignée", en: "Spider plant" },
		"foliage",
		[2, 2, 2, 2],
	),
	curated(
		126882,
		"Aloe vera",
		{ fr: "Aloe vera", en: "Aloe vera" },
		"succulent",
		[3, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		201458,
		"Ficus lyrata",
		{ fr: "Ficus lyrata", en: "Fiddle-leaf fig" },
		"foliage",
		[3, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		866988,
		"Goeppertia orbifolia",
		{ fr: "Calathea orbifolia", en: "Calathea orbifolia" },
		"foliage",
		[2, 2, 2, 3],
	),
	curated(
		125439,
		"Pilea peperomioides",
		{ fr: "Pilea", en: "Chinese money plant" },
		"foliage",
		[2, 2, 2, 2],
	),
	curated(
		49143,
		"Strelitzia reginae",
		{ fr: "Oiseau de paradis", en: "Bird of paradise" },
		"foliage",
		[3, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		126509,
		"Dracaena reflexa angustifolia",
		{ fr: "Dracaena marginata", en: "Dragon tree" },
		"foliage",
		[2, 2, 2, 1],
		{ toxic: true },
	),
	curated(
		126515,
		"Dracaena fragrans",
		{ fr: "Dracaena fragrans", en: "Corn plant" },
		"foliage",
		[1, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		158118,
		"Aglaonema commutatum",
		{ fr: "Aglaonema", en: "Chinese evergreen" },
		"foliage",
		[1, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		120490,
		"Philodendron hederaceum",
		{ fr: "Philodendron grimpant", en: "Heartleaf philodendron" },
		"climber",
		[1, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		166493,
		"Peperomia obtusifolia",
		{ fr: "Pépéromia", en: "Baby rubber plant" },
		"foliage",
		[2, 2, 2, 2],
	),
	curated(
		366346,
		"Maranta leuconeura",
		{ fr: "Maranta", en: "Prayer plant" },
		"foliage",
		[2, 2, 2, 3],
	),
	curated(
		327855,
		"Fittonia albivenis",
		{ fr: "Fittonia", en: "Nerve plant" },
		"foliage",
		[2, 1, 2, 3],
	),
	curated(
		169883,
		"Tradescantia zebrina",
		{ fr: "Misère", en: "Inch plant" },
		"foliage",
		[2, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		125396,
		"Aspidistra elatior",
		{ fr: "Aspidistra", en: "Cast iron plant" },
		"foliage",
		[1, 2, 1, 1],
	),
	curated(
		84356,
		"Asplenium nidus",
		{ fr: "Fougère nid d'oiseau", en: "Bird's nest fern" },
		"fern",
		[1, 2, 2, 3],
	),
	curated(
		130866,
		"Nephrolepis exaltata",
		{ fr: "Fougère de Boston", en: "Boston fern" },
		"fern",
		[2, 1, 2, 3],
	),
	curated(
		276548,
		"Chrysalidocarpus lutescens",
		{ fr: "Palmier Areca", en: "Areca palm" },
		"palm",
		[2, 2, 2, 2],
	),
	curated(
		135400,
		"Howea forsteriana",
		{ fr: "Kentia", en: "Kentia palm" },
		"palm",
		[1, 2, 2, 2],
	),
	curated(
		283400,
		"Chamaedorea elegans",
		{ fr: "Palmier nain", en: "Parlour palm" },
		"palm",
		[1, 2, 2, 2],
	),
	curated(
		206192,
		"Beaucarnea recurvata",
		{ fr: "Pied d'éléphant", en: "Ponytail palm" },
		"succulent",
		[3, 3, 2, 1],
	),
	curated(
		206749,
		"Echeveria elegans",
		{ fr: "Echeveria", en: "Mexican snowball" },
		"succulent",
		[3, 3, 2, 1],
		{
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		76465,
		"Crassula ovata",
		{ fr: "Arbre de jade", en: "Jade plant" },
		"succulent",
		[3, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		276072,
		"Sedum morganianum",
		{ fr: "Queue d'âne", en: "Burro's tail" },
		"succulent",
		[3, 3, 2, 1],
	),
	curated(
		164326,
		"Kalanchoe blossfeldiana",
		{ fr: "Kalanchoé", en: "Flaming Katy" },
		"succulent",
		[3, 3, 2, 1],
		{
			toxic: true,
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		78267,
		"Opuntia microdasys",
		{ fr: "Oreilles de lapin", en: "Bunny ears cactus" },
		"cactus",
		[3, 3, 2, 1],
	),
	curated(
		273594,
		"Mammillaria elongata",
		{ fr: "Mammillaria", en: "Ladyfinger cactus" },
		"cactus",
		[3, 3, 2, 1],
		{ floweringSeasons: ["spring"] },
	),
	curated(
		869962,
		"Kroenleinia grusonii",
		{ fr: "Coussin de belle-mère", en: "Golden barrel cactus" },
		"cactus",
		[3, 3, 2, 1],
	),
	curated(
		51223,
		"Schlumbergera truncata",
		{ fr: "Cactus de Noël", en: "Christmas cactus" },
		"cactus",
		[2, 2, 1, 2],
		{ floweringSeasons: ["winter"] },
	),
	curated(
		322318,
		"Euphorbia trigona",
		{ fr: "Cactus cathédrale", en: "African milk tree" },
		"succulent",
		[3, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		479482,
		"Gasteria carinata",
		{ fr: "Gasteria", en: "Gasteria" },
		"succulent",
		[2, 3, 2, 1],
	),
	curated(
		186097,
		"Lithops",
		{ fr: "Plante caillou", en: "Living stones" },
		"succulent",
		[3, 3, 2, 1],
		{ floweringSeasons: ["autumn"] },
	),
	curated(
		69235,
		"Anthurium andraeanum",
		{ fr: "Anthurium", en: "Flamingo flower" },
		null,
		[2, 2, 3, 3],
		{
			toxic: true,
			floweringSeasons: ["spring", "summer", "autumn"],
		},
	),
	curated(
		129523,
		"Hoya carnosa",
		{ fr: "Fleur de porcelaine", en: "Wax plant" },
		"climber",
		[2, 2, 2, 2],
		{ floweringSeasons: ["summer"] },
	),
	curated(
		927983,
		"Streptocarpus ionanthus",
		{ fr: "Violette africaine", en: "African violet" },
		null,
		[2, 2, 2, 2],
		{
			floweringSeasons: ["spring", "summer", "autumn", "winter"],
		},
	),
	curated(
		341141,
		"Cyclamen persicum",
		{ fr: "Cyclamen", en: "Cyclamen" },
		null,
		[2, 2, 1, 2],
		{
			toxic: true,
			floweringSeasons: ["autumn", "winter"],
		},
	),
	curated(
		327898,
		"Begonia rex",
		{ fr: "Bégonia rex", en: "Rex begonia" },
		"foliage",
		[2, 2, 2, 3],
		{ toxic: true },
	),
	curated(
		1628098,
		"Hibiscus rosa-sinensis",
		{ fr: "Hibiscus", en: "Hibiscus" },
		"shrub",
		[3, 1, 2, 2],
		{
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		67756,
		"Dendrobium nobile",
		{ fr: "Dendrobium", en: "Dendrobium" },
		"orchid",
		[3, 2, 2, 2],
		{
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		331124,
		"Citrus limon",
		{ fr: "Citronnier", en: "Lemon tree" },
		"citrus",
		[3, 2, 2, 2],
		{
			toxic: true,
			floweringSeasons: ["spring"],
		},
	),
	curated(
		210990,
		"Gardenia jasminoides",
		{ fr: "Gardénia", en: "Gardenia" },
		"shrub",
		[2, 2, 2, 3],
		{
			toxic: true,
			floweringSeasons: ["summer"],
		},
	),
	curated(
		342641,
		"Jasminum polyanthum",
		{ fr: "Jasmin de Chine", en: "Pink jasmine" },
		"climber",
		[3, 2, 1, 2],
		{
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		276734,
		"Guzmania lingulata",
		{ fr: "Guzmania", en: "Guzmania" },
		null,
		[2, 2, 2, 3],
		{
			floweringSeasons: ["summer"],
			floweringType: "monocarpic",
		},
	),
	curated(
		52666,
		"Dionaea muscipula",
		{ fr: "Dionée", en: "Venus flytrap" },
		"carnivorous",
		[3, 1, 2, 3],
		{
			floweringSeasons: ["spring"],
		},
	),
	curated(
		61398,
		"Ocimum basilicum",
		{ fr: "Basilic", en: "Basil" },
		"herb",
		[3, 1, 3, 2],
		{
			floweringSeasons: ["summer"],
			floweringType: "monocarpic",
			lifespan: "annual",
		},
	),
	curated(
		62652,
		"Mentha spicata",
		{ fr: "Menthe verte", en: "Spearmint" },
		"herb",
		[2, 1, 2, 2],
		{
			toxic: true,
			outdoor: true,
			floweringSeasons: ["summer"],
		},
	),
	curated(
		636795,
		"Salvia rosmarinus",
		{ fr: "Romarin", en: "Rosemary" },
		"herb",
		[3, 2, 1, 1],
		{
			outdoor: true,
			floweringSeasons: ["spring"],
		},
	),
	curated(
		50996,
		"Ficus benjamina",
		{ fr: "Figuier pleureur", en: "Weeping fig" },
		"foliage",
		[2, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		143208,
		"Syngonium podophyllum",
		{ fr: "Syngonium", en: "Arrowhead plant" },
		"climber",
		[2, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		418734,
		"Ceropegia woodii",
		{ fr: "Chaîne des cœurs", en: "String of hearts" },
		"climber",
		[2, 2, 2, 1],
		{ floweringSeasons: ["summer"] },
	),
	curated(
		943005,
		"Curio rowleyanus",
		{ fr: "Collier de perles", en: "String of pearls" },
		"succulent",
		[2, 2, 2, 1],
		{
			toxic: true,
			floweringSeasons: ["spring"],
		},
	),
	curated(
		291380,
		"Ficus retusa",
		{ fr: "Ficus retusa", en: "Cuban laurel" },
		"bonsai",
		[3, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		54982,
		"Ficus microcarpa",
		{ fr: "Ficus Ginseng", en: "Ginseng fig" },
		"bonsai",
		[3, 2, 2, 2],
		{ toxic: true },
	),
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

export const usageName = (plant: CuratedPlant) =>
	locale() === "en" ? plant.names.en : plant.names.fr;

// The names people use, like "Pothos", that iNaturalist may not know
export const searchCuratedPlants = (query: string) => {
	const needle = normalizeForSearch(query.trim());
	return CURATED_PLANTS.filter((plant) =>
		normalizeForSearch(usageName(plant)).includes(needle),
	);
};
