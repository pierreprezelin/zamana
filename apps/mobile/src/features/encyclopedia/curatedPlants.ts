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

type Aliases = { fr: string[]; en: string[] };

export type CuratedPlant = {
	taxonId: number;
	scientificName: string;
	names: UsageNames;
	aliases: Aliases;
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

type Details = Partial<
	Pick<
		CuratedPlant,
		| "aliases"
		| "toxic"
		| "outdoor"
		| "floweringSeasons"
		| "floweringType"
		| "lifespan"
	>
>;

const curated = (
	taxonId: number,
	scientificName: string,
	names: UsageNames,
	type: PlantType | null,
	[light, watering, temperature, humidity]: [Level, Level, Level, Level],
	{
		aliases = { fr: [], en: [] },
		toxic = false,
		outdoor = false,
		floweringSeasons = [],
		floweringType = floweringSeasons.length > 0 ? "polycarpic" : null,
		lifespan = "perennial",
	}: Details = {},
): CuratedPlant => ({
	taxonId,
	scientificName,
	names,
	aliases,
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
		{
			aliases: {
				fr: ["faux philodendron", "plante gruyère"],
				en: ["swiss cheese plant"],
			},
			toxic: true,
		},
	),
	curated(
		367277,
		"Zamioculcas zamiifolia",
		{ fr: "Zamioculcas", en: "ZZ plant" },
		"foliage",
		[1, 3, 2, 1],
		{ aliases: { fr: ["plante ZZ"], en: ["zanzibar gem"] }, toxic: true },
	),
	curated(
		126507,
		"Ficus elastica",
		{ fr: "Caoutchouc", en: "Rubber plant" },
		"foliage",
		[2, 2, 2, 2],
		{ aliases: { fr: [], en: ["rubber tree"] }, toxic: true },
	),
	curated(
		69223,
		"Epipremnum aureum",
		{ fr: "Pothos", en: "Pothos" },
		"climber",
		[1, 2, 2, 2],
		{
			aliases: {
				fr: ["lierre du diable"],
				en: ["devil's ivy", "golden pothos"],
			},
			toxic: true,
		},
	),
	curated(
		67710,
		"Sansevieria trifasciata",
		{ fr: "Langue de belle-mère", en: "Snake plant" },
		"succulent",
		[1, 3, 2, 1],
		{
			aliases: { fr: ["sansevière"], en: ["mother-in-law's tongue"] },
			toxic: true,
		},
	),
	curated(
		284040,
		"Spathiphyllum wallisii",
		{ fr: "Spathiphyllum", en: "Peace lily" },
		"foliage",
		[1, 2, 2, 3],
		{
			aliases: { fr: ["fleur de lune", "lys de la paix"], en: [] },
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
		{ aliases: { fr: ["phalangère"], en: ["airplane plant"] } },
	),
	curated(
		126882,
		"Aloe vera",
		{ fr: "Aloe vera", en: "Aloe vera" },
		"succulent",
		[3, 3, 2, 1],
		{ aliases: { fr: ["aloès"], en: [] }, toxic: true },
	),
	curated(
		201458,
		"Ficus lyrata",
		{ fr: "Ficus lyrata", en: "Fiddle-leaf fig" },
		"foliage",
		[3, 2, 2, 2],
		{ aliases: { fr: ["figuier lyre"], en: [] }, toxic: true },
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
		{
			aliases: {
				fr: ["plante à monnaie chinoise", "plante crêpe"],
				en: ["pancake plant", "UFO plant"],
			},
		},
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
		{ aliases: { fr: ["dragonnier", "dracéna"], en: [] }, toxic: true },
	),
	curated(
		126515,
		"Dracaena fragrans",
		{ fr: "Dracaena fragrans", en: "Corn plant" },
		"foliage",
		[1, 2, 2, 2],
		{ aliases: { fr: ["dracéna", "bois du Brésil"], en: [] }, toxic: true },
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
		{
			aliases: {
				fr: ["philodendron scandens"],
				en: ["sweetheart plant", "philodendron scandens"],
			},
			toxic: true,
		},
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
		{ aliases: { fr: ["plante qui prie"], en: [] } },
	),
	curated(
		327855,
		"Fittonia albivenis",
		{ fr: "Fittonia", en: "Nerve plant" },
		"foliage",
		[2, 1, 2, 3],
		{ aliases: { fr: [], en: ["mosaic plant"] } },
	),
	curated(
		169883,
		"Tradescantia zebrina",
		{ fr: "Misère", en: "Inch plant" },
		"foliage",
		[2, 2, 2, 2],
		{ aliases: { fr: ["éphémère"], en: ["wandering dude"] }, toxic: true },
	),
	curated(
		125396,
		"Aspidistra elatior",
		{ fr: "Aspidistra", en: "Cast iron plant" },
		"foliage",
		[1, 2, 1, 1],
		{ aliases: { fr: ["plante des concierges"], en: [] } },
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
		{ aliases: { fr: [], en: ["sword fern"] } },
	),
	curated(
		276548,
		"Chrysalidocarpus lutescens",
		{ fr: "Palmier Areca", en: "Areca palm" },
		"palm",
		[2, 2, 2, 2],
		{
			aliases: {
				fr: ["dypsis", "palmier doré"],
				en: ["dypsis", "butterfly palm", "golden cane palm"],
			},
		},
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
		{ aliases: { fr: ["palmier de salon"], en: ["parlor palm"] } },
	),
	curated(
		206192,
		"Beaucarnea recurvata",
		{ fr: "Pied d'éléphant", en: "Ponytail palm" },
		"succulent",
		[3, 3, 2, 1],
		{ aliases: { fr: ["nolina"], en: ["elephant's foot", "nolina"] } },
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
		{ aliases: { fr: ["arbre à argent"], en: [] }, toxic: true },
	),
	curated(
		276072,
		"Sedum morganianum",
		{ fr: "Queue d'âne", en: "Burro's tail" },
		"succulent",
		[3, 3, 2, 1],
		{ aliases: { fr: ["orpin"], en: ["donkey's tail"] } },
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
		{ aliases: { fr: ["echinocactus"], en: ["echinocactus"] } },
	),
	curated(
		51223,
		"Schlumbergera truncata",
		{ fr: "Cactus de Noël", en: "Christmas cactus" },
		"cactus",
		[2, 2, 1, 2],
		{
			aliases: { fr: [], en: ["thanksgiving cactus"] },
			floweringSeasons: ["winter"],
		},
	),
	curated(
		322318,
		"Euphorbia trigona",
		{ fr: "Cactus cathédrale", en: "African milk tree" },
		"succulent",
		[3, 3, 2, 1],
		{ aliases: { fr: ["euphorbe"], en: ["cathedral cactus"] }, toxic: true },
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
		{
			aliases: { fr: ["pierre vivante"], en: [] },
			floweringSeasons: ["autumn"],
		},
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
		{
			aliases: { fr: ["fleur de cire"], en: [] },
			floweringSeasons: ["summer"],
		},
	),
	curated(
		927983,
		"Streptocarpus ionanthus",
		{ fr: "Violette africaine", en: "African violet" },
		null,
		[2, 2, 2, 2],
		{
			aliases: { fr: ["saintpaulia"], en: ["saintpaulia"] },
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
			aliases: { fr: ["rose de Chine"], en: ["chinese hibiscus"] },
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
			aliases: { fr: ["attrape-mouche"], en: [] },
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
		{ aliases: { fr: [], en: ["rosary vine"] }, floweringSeasons: ["summer"] },
	),
	curated(
		943005,
		"Curio rowleyanus",
		{ fr: "Collier de perles", en: "String of pearls" },
		"succulent",
		[2, 2, 2, 1],
		{
			aliases: { fr: ["senecio"], en: ["senecio"] },
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
	curated(
		206267,
		"Monstera adansonii",
		{ fr: "Monstera adansonii", en: "Swiss cheese vine" },
		"climber",
		[2, 2, 2, 3],
		{ aliases: { fr: ["monstera à trous"], en: ["monkey mask"] }, toxic: true },
	),
	curated(
		1404267,
		"Alocasia × mortfontanensis",
		{ fr: "Alocasia", en: "African mask plant" },
		"foliage",
		[2, 2, 3, 3],
		{
			aliases: {
				fr: ["oreille d'éléphant"],
				en: ["alocasia polly", "elephant ear"],
			},
			toxic: true,
		},
	),
	curated(
		1172861,
		"Goeppertia zebrina",
		{ fr: "Calathea zebrina", en: "Zebra plant" },
		"foliage",
		[2, 2, 2, 3],
		{ aliases: { fr: [], en: ["calathea zebrina"] } },
	),
	curated(
		154852,
		"Pachira aquatica",
		{ fr: "Pachira", en: "Money tree" },
		"foliage",
		[2, 2, 2, 2],
		{ aliases: { fr: ["arbre à monnaie", "châtaignier de Guyane"], en: [] } },
	),
	curated(
		800897,
		"Dracaena sanderiana",
		{ fr: "Bambou de la chance", en: "Lucky bamboo" },
		"foliage",
		[1, 2, 2, 2],
		{ aliases: { fr: ["lucky bamboo"], en: [] }, toxic: true },
	),
	curated(
		201452,
		"Yucca gigantea",
		{ fr: "Yucca", en: "Spineless yucca" },
		"foliage",
		[3, 3, 2, 1],
		{ aliases: { fr: ["yucca éléphant"], en: [] }, toxic: true },
	),
	curated(
		1239449,
		"Heptapleurum arboricola",
		{ fr: "Schefflera", en: "Dwarf umbrella tree" },
		"foliage",
		[2, 2, 2, 2],
		{ aliases: { fr: ["arbre ombrelle"], en: ["schefflera"] }, toxic: true },
	),
	curated(
		1719371,
		"Hedera helix",
		{ fr: "Lierre", en: "English ivy" },
		"climber",
		[1, 2, 1, 2],
		{ aliases: { fr: ["lierre commun"], en: [] }, toxic: true },
	),
	curated(
		162845,
		"Euphorbia pulcherrima",
		{ fr: "Poinsettia", en: "Poinsettia" },
		"shrub",
		[3, 2, 2, 2],
		{
			aliases: { fr: ["étoile de Noël"], en: ["christmas star"] },
			toxic: true,
			floweringSeasons: ["winter"],
		},
	),
	curated(
		168422,
		"Sansevieria cylindrica",
		{ fr: "Sansevieria cylindrica", en: "Cylindrical snake plant" },
		"succulent",
		[1, 3, 2, 1],
		{
			aliases: { fr: ["sansevière cylindrique"], en: ["african spear"] },
			toxic: true,
		},
	),
	curated(
		346616,
		"Scindapsus pictus",
		{ fr: "Pothos argenté", en: "Satin pothos" },
		"climber",
		[1, 2, 2, 2],
		{ aliases: { fr: [], en: ["silver pothos"] }, toxic: true },
	),
	curated(
		912388,
		"Rhaphidophora tetrasperma",
		{ fr: "Mini monstera", en: "Mini monstera" },
		"climber",
		[2, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		206266,
		"Dieffenbachia seguine",
		{ fr: "Dieffenbachia", en: "Dumb cane" },
		"foliage",
		[1, 2, 2, 2],
		{
			aliases: { fr: ["canne des muets"], en: [] },
			toxic: true,
		},
	),
	curated(
		1172810,
		"Goeppertia makoyana",
		{ fr: "Calathea makoyana", en: "Peacock plant" },
		"foliage",
		[2, 2, 2, 3],
		{ aliases: { fr: ["plante paon"], en: ["calathea makoyana"] } },
	),
	curated(
		867364,
		"Goeppertia insignis",
		{ fr: "Calathea lancifolia", en: "Rattlesnake plant" },
		"foliage",
		[2, 2, 2, 3],
		{ aliases: { fr: [], en: ["calathea lancifolia"] } },
	),
	curated(
		426720,
		"Stromanthe thalia",
		{ fr: "Stromanthe", en: "Stromanthe triostar" },
		"foliage",
		[2, 2, 2, 3],
		{ aliases: { fr: ["triostar"], en: [] } },
	),
	curated(
		480528,
		"Ctenanthe burle-marxii",
		{ fr: "Ctenanthe", en: "Fishbone prayer plant" },
		"foliage",
		[2, 2, 2, 3],
	),
	curated(
		985710,
		"Thaumatophyllum bipinnatifidum",
		{ fr: "Philodendron selloum", en: "Tree philodendron" },
		"foliage",
		[2, 2, 2, 2],
		{
			aliases: {
				fr: ["philodendron bipinnatifidum"],
				en: ["philodendron selloum", "lacy tree philodendron"],
			},
			toxic: true,
		},
	),
	curated(
		1600433,
		"Peperomia argyraea",
		{ fr: "Pépéromia pastèque", en: "Watermelon peperomia" },
		"foliage",
		[2, 2, 2, 2],
	),
	curated(
		164011,
		"Hypoestes phyllostachya",
		{ fr: "Plante à pois", en: "Polka dot plant" },
		"foliage",
		[2, 1, 2, 2],
	),
	curated(
		127387,
		"Codiaeum variegatum",
		{ fr: "Croton", en: "Croton" },
		"foliage",
		[3, 2, 2, 2],
		{ toxic: true },
	),
	curated(
		284651,
		"Begonia maculata",
		{ fr: "Bégonia maculata", en: "Polka dot begonia" },
		"foliage",
		[2, 2, 2, 3],
		{
			aliases: { fr: ["bégonia à pois"], en: [] },
			toxic: true,
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		327754,
		"Oxalis triangularis",
		{ fr: "Oxalis pourpre", en: "Purple shamrock" },
		"foliage",
		[2, 2, 2, 2],
		{
			aliases: { fr: ["faux trèfle"], en: ["false shamrock"] },
			toxic: true,
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		162972,
		"Ficus pumila",
		{ fr: "Ficus pumila", en: "Creeping fig" },
		"climber",
		[2, 1, 2, 3],
		{ aliases: { fr: ["figuier rampant"], en: [] }, toxic: true },
	),
	curated(
		577810,
		"Cissus alata",
		{ fr: "Vigne d'appartement", en: "Grape ivy" },
		"climber",
		[1, 2, 2, 2],
		{ aliases: { fr: ["cissus rhombifolia"], en: ["cissus rhombifolia"] } },
	),
	curated(
		126735,
		"Fatsia japonica",
		{ fr: "Fatsia", en: "Japanese aralia" },
		"foliage",
		[1, 2, 1, 2],
		{ aliases: { fr: ["aralia du Japon"], en: [] }, toxic: true },
	),
	curated(
		75604,
		"Asparagus setaceus",
		{ fr: "Asparagus plumeux", en: "Asparagus fern" },
		"foliage",
		[2, 2, 2, 2],
		{ aliases: { fr: [], en: ["lace fern"] }, toxic: true },
	),
	curated(
		283915,
		"Rhapis excelsa",
		{ fr: "Palmier rhapis", en: "Lady palm" },
		"palm",
		[1, 2, 2, 2],
		{ aliases: { fr: ["palmier bambou"], en: ["bamboo palm"] } },
	),
	curated(
		127908,
		"Phlebodium aureum",
		{ fr: "Fougère bleue", en: "Blue star fern" },
		"fern",
		[1, 2, 2, 2],
		{ aliases: { fr: [], en: ["golden polypody"] } },
	),
	curated(
		76595,
		"Cyrtomium falcatum",
		{ fr: "Fougère houx", en: "Holly fern" },
		"fern",
		[1, 2, 1, 2],
	),
	curated(
		78777,
		"Pteris cretica",
		{ fr: "Ptéris", en: "Cretan brake fern" },
		"fern",
		[1, 2, 2, 3],
	),
	curated(
		158023,
		"Adiantum raddianum",
		{ fr: "Capillaire", en: "Maidenhair fern" },
		"fern",
		[2, 1, 2, 3],
		{ aliases: { fr: ["cheveux de Vénus"], en: [] } },
	),
	curated(
		577654,
		"Haworthiopsis attenuata",
		{ fr: "Haworthia zèbre", en: "Zebra haworthia" },
		"succulent",
		[2, 3, 2, 1],
	),
	curated(
		335091,
		"Kalanchoe tomentosa",
		{ fr: "Plante panda", en: "Panda plant" },
		"succulent",
		[3, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		326086,
		"Portulacaria afra",
		{ fr: "Portulacaria", en: "Elephant bush" },
		"succulent",
		[3, 3, 2, 1],
		{ aliases: { fr: ["pourpier en arbre", "jade nain"], en: ["dwarf jade"] } },
	),
	curated(
		162839,
		"Euphorbia milii",
		{ fr: "Épine du Christ", en: "Crown of thorns" },
		"succulent",
		[3, 3, 2, 1],
		{
			aliases: { fr: ["euphorbe de Madagascar"], en: ["christ plant"] },
			toxic: true,
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		273763,
		"Graptopetalum paraguayense",
		{ fr: "Graptopetalum", en: "Ghost plant" },
		"succulent",
		[3, 3, 2, 1],
		{ aliases: { fr: ["plante fantôme"], en: [] } },
	),
	curated(
		164327,
		"Kalanchoe daigremontiana",
		{ fr: "Mère de milliers", en: "Mother of thousands" },
		"succulent",
		[3, 3, 2, 1],
		{ toxic: true },
	),
	curated(
		162855,
		"Euphorbia tirucalli",
		{ fr: "Arbre à crayons", en: "Pencil cactus" },
		"succulent",
		[3, 3, 2, 1],
		{
			aliases: { fr: ["euphorbe crayon"], en: ["firestick plant"] },
			toxic: true,
		},
	),
	curated(
		320319,
		"Cereus repandus",
		{ fr: "Cierge du Pérou", en: "Peruvian apple cactus" },
		"cactus",
		[3, 3, 2, 1],
		{ aliases: { fr: ["cereus peruvianus"], en: ["cereus peruvianus"] } },
	),
	curated(
		438961,
		"Gymnocalycium mihanovichii",
		{ fr: "Cactus greffé", en: "Moon cactus" },
		"cactus",
		[2, 3, 2, 1],
	),
	curated(
		119900,
		"Rhipsalis baccifera",
		{ fr: "Rhipsalis", en: "Mistletoe cactus" },
		"cactus",
		[2, 2, 2, 2],
		{ aliases: { fr: ["cactus gui"], en: [] } },
	),
	curated(
		1435384,
		"Rhipsalidopsis gaertneri",
		{ fr: "Cactus de Pâques", en: "Easter cactus" },
		"cactus",
		[2, 2, 2, 2],
		{
			aliases: {
				fr: ["hatiora", "schlumbergera gaertneri"],
				en: ["hatiora", "schlumbergera gaertneri"],
			},
			floweringSeasons: ["spring"],
		},
	),
	curated(
		85410,
		"Epiphyllum oxypetalum",
		{ fr: "Reine de la nuit", en: "Queen of the night" },
		"cactus",
		[2, 2, 2, 2],
		{ floweringSeasons: ["summer"] },
	),
	curated(
		210194,
		"Clivia miniata",
		{ fr: "Clivia", en: "Bush lily" },
		"foliage",
		[2, 2, 1, 2],
		{
			toxic: true,
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		51833,
		"Hippeastrum",
		{ fr: "Amaryllis", en: "Amaryllis" },
		"foliage",
		[3, 2, 2, 2],
		{ toxic: true, floweringSeasons: ["winter"] },
	),
	curated(
		416202,
		"Aechmea fasciata",
		{ fr: "Aechmea", en: "Urn plant" },
		"foliage",
		[2, 2, 2, 2],
		{
			aliases: { fr: [], en: ["silver vase"] },
			floweringSeasons: ["summer"],
			floweringType: "monocarpic",
		},
	),
	curated(
		141279,
		"Tillandsia ionantha",
		{ fr: "Fille de l'air", en: "Air plant" },
		"foliage",
		[3, 2, 2, 2],
		{
			aliases: { fr: [], en: ["sky plant"] },
			floweringSeasons: ["spring", "summer"],
			floweringType: "monocarpic",
		},
	),
	curated(
		47848,
		"Paphiopedilum",
		{ fr: "Sabot de Vénus", en: "Slipper orchid" },
		"orchid",
		[2, 2, 2, 2],
		{
			aliases: { fr: [], en: ["lady slipper orchid"] },
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		128976,
		"Cymbidium",
		{ fr: "Cymbidium", en: "Boat orchid" },
		"orchid",
		[3, 2, 1, 2],
		{
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		430622,
		"Aeschynanthus radicans",
		{ fr: "Aeschynanthus", en: "Lipstick plant" },
		"foliage",
		[2, 2, 2, 3],
		{
			aliases: { fr: ["plante rouge à lèvres"], en: [] },
			floweringSeasons: ["summer"],
		},
	),
	curated(
		410380,
		"Rhododendron simsii",
		{ fr: "Azalée", en: "Azalea" },
		"shrub",
		[2, 1, 1, 2],
		{
			aliases: { fr: ["azalée des Indes"], en: [] },
			toxic: true,
			floweringSeasons: ["winter", "spring"],
		},
	),
	curated(
		85469,
		"Thymus vulgaris",
		{ fr: "Thym", en: "Thyme" },
		"herb",
		[3, 2, 2, 1],
		{ outdoor: true, floweringSeasons: ["spring", "summer"] },
	),
	curated(
		78465,
		"Petroselinum crispum",
		{ fr: "Persil", en: "Parsley" },
		"herb",
		[2, 1, 2, 2],
		{
			toxic: true,
			floweringSeasons: ["summer"],
			floweringType: "monocarpic",
			lifespan: "biennial",
		},
	),
	curated(
		59254,
		"Allium schoenoprasum",
		{ fr: "Ciboulette", en: "Chives" },
		"herb",
		[3, 1, 2, 2],
		{ toxic: true, outdoor: true, floweringSeasons: ["spring", "summer"] },
	),
	curated(
		708697,
		"Citrus × microcarpa",
		{ fr: "Calamondin", en: "Calamondin" },
		"citrus",
		[3, 2, 2, 2],
		{
			aliases: { fr: ["oranger d'appartement"], en: [] },
			toxic: true,
			floweringSeasons: ["spring", "summer"],
		},
	),
	curated(
		57140,
		"Olea europaea",
		{ fr: "Olivier", en: "Olive tree" },
		"fruitTree",
		[3, 2, 2, 1],
		{ outdoor: true, floweringSeasons: ["spring"] },
	),
	curated(
		52646,
		"Nepenthes",
		{ fr: "Népenthès", en: "Tropical pitcher plant" },
		"carnivorous",
		[2, 2, 3, 3],
		{ aliases: { fr: ["plante à urnes"], en: ["monkey cups"] } },
	),
	curated(
		52656,
		"Drosera capensis",
		{ fr: "Droséra du Cap", en: "Cape sundew" },
		"carnivorous",
		[3, 1, 2, 3],
		{ floweringSeasons: ["summer"] },
	),
	curated(
		357658,
		"Ehretia microphylla",
		{ fr: "Carmona", en: "Fukien tea" },
		"bonsai",
		[3, 2, 2, 2],
		{ aliases: { fr: ["thé de Fukien"], en: ["carmona"] } },
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
	206267: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/261544099/medium.jpg",
		attribution: "no rights reserved",
	}, // Monstera adansonii
	1404267: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/221708201/medium.jpeg",
		attribution: "(c) Louis Aureglia, some rights reserved (CC BY)",
	}, // Alocasia × mortfontanensis
	1172861: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/155243209/medium.jpeg",
		attribution: "no rights reserved",
	}, // Goeppertia zebrina
	154852: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/660317626/medium.jpg",
		attribution: "no rights reserved",
	}, // Pachira aquatica
	800897: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/519998352/medium.jpg",
		attribution: "no rights reserved",
	}, // Dracaena sanderiana
	201452: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/194196998/medium.jpg",
		attribution: "(c) ELOYJIMENEZ13, some rights reserved (CC BY)",
	}, // Yucca gigantea
	1239449: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/740242051/medium.jpg",
		attribution: "(c) James K. Douch, some rights reserved (CC BY-SA)",
	}, // Heptapleurum arboricola
	1719371: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/512123573/medium.jpg",
		attribution: "no rights reserved",
	}, // Hedera helix
	162845: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/180483406/medium.jpeg",
		attribution: "(c) Gianni Del Bufalo bygdb, some rights reserved (CC BY)",
	}, // Euphorbia pulcherrima
	168422: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/515717431/medium.jpg",
		attribution: "no rights reserved",
	}, // Sansevieria cylindrica
	346616: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/300765358/medium.jpg",
		attribution: "(c) Igor Balashov, some rights reserved (CC BY)",
	}, // Scindapsus pictus
	912388: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/518563518/medium.jpg",
		attribution: "no rights reserved",
	}, // Rhaphidophora tetrasperma
	206266: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/320091499/medium.jpg",
		attribution: "(c) Jared Lincenberg, some rights reserved (CC BY)",
	}, // Dieffenbachia seguine
	1172810: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/613981963/medium.jpg",
		attribution: "(c) Victor Porta, some rights reserved (CC BY)",
	}, // Goeppertia makoyana
	867364: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/40013050/medium.jpg",
		attribution: "no rights reserved",
	}, // Goeppertia insignis
	426720: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/762233930/medium.jpg",
		attribution: "(c) 鄭雪雲, some rights reserved (CC BY)",
	}, // Stromanthe thalia
	480528: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/208181333/medium.jpeg",
		attribution: "(c) Greg III Espera, some rights reserved (CC BY)",
	}, // Ctenanthe burle-marxii
	985710: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/627851633/medium.jpg",
		attribution: "no rights reserved",
	}, // Thaumatophyllum bipinnatifidum
	1600433: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/58249205/medium.jpeg",
		attribution: "(c) Diogo Luiz, some rights reserved (CC BY)",
	}, // Peperomia argyraea
	164011: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/325859331/medium.jpeg",
		attribution: "(c) Patrícia Mees, some rights reserved (CC BY)",
	}, // Hypoestes phyllostachya
	127387: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/471307397/medium.jpg",
		attribution:
			"(c) Roman A. Lagazyuk (Роман А. Лагазюк), some rights reserved (CC BY)",
	}, // Codiaeum variegatum
	284651: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/572081473/medium.jpg",
		attribution: "no rights reserved",
	}, // Begonia maculata
	327754: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/607813455/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Oxalis triangularis
	162972: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/345538353/medium.jpeg",
		attribution: "(c) Jo Roberts, some rights reserved (CC BY)",
	}, // Ficus pumila
	577810: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/167390029/medium.jpg",
		attribution: "no rights reserved",
	}, // Cissus alata
	126735: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/323075447/medium.jpg",
		attribution: "(c) Katie Carter, some rights reserved (CC BY)",
	}, // Fatsia japonica
	75604: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/126444662/medium.jpg",
		attribution: "(c) johnyochum, some rights reserved (CC BY)",
	}, // Asparagus setaceus
	283915: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/710060275/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Rhapis excelsa
	127908: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/562171847/medium.jpg",
		attribution: "(c) Tim Johnson, some rights reserved (CC BY)",
	}, // Phlebodium aureum
	76595: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/10620522/medium.jpg",
		attribution: "(c) Antonia Bookbinder, some rights reserved (CC BY-SA)",
	}, // Cyrtomium falcatum
	78777: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/29946298/medium.jpg",
		attribution: "(c) Pieter Pelser, some rights reserved (CC BY)",
	}, // Pteris cretica
	158023: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/459608824/medium.jpeg",
		attribution: "(c) Kate McAlpine, some rights reserved (CC BY)",
	}, // Adiantum raddianum
	577654: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/29478774/medium.jpg",
		attribution: "(c) Gianni Del Bufalo bygdb, some rights reserved (CC BY)",
	}, // Haworthiopsis attenuata
	335091: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/726832628/medium.jpg",
		attribution: "(c) poosnap, some rights reserved (CC BY)",
	}, // Kalanchoe tomentosa
	326086: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/387718905/medium.jpg",
		attribution: "(c) Andrew Hankey, some rights reserved (CC BY-SA)",
	}, // Portulacaria afra
	162839: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/532443239/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Euphorbia milii
	273763: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/483135916/medium.jpeg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Graptopetalum paraguayense
	164327: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/401861042/medium.jpg",
		attribution: "(c) Cindy Bell, some rights reserved (CC BY)",
	}, // Kalanchoe daigremontiana
	162855: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/738218835/medium.jpg",
		attribution: "(c) Siya ul haque, some rights reserved (CC BY)",
	}, // Euphorbia tirucalli
	320319: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/261344613/medium.jpg",
		attribution: "(c) Eugene Popov, some rights reserved (CC BY)",
	}, // Cereus repandus
	438961: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/65247463/medium.jpg",
		attribution: "no rights reserved",
	}, // Gymnocalycium mihanovichii
	119900: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/343842691/medium.jpeg",
		attribution: "no rights reserved",
	}, // Rhipsalis baccifera
	1435384: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/107990104/medium.jpg",
		attribution: "(c) Jeremy Gilmore, some rights reserved (CC BY)",
	}, // Rhipsalidopsis gaertneri
	85410: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/561249880/medium.jpg",
		attribution: "(c) Anne Parker, some rights reserved (CC BY)",
	}, // Epiphyllum oxypetalum
	210194: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/625033028/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Clivia miniata
	51833: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/32356632/medium.jpg",
		attribution: "(c) Rebecka Creed, some rights reserved (CC BY)",
	}, // Hippeastrum
	416202: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/658958470/medium.jpg",
		attribution: "(c) Yurii Basov, some rights reserved (CC BY)",
	}, // Aechmea fasciata
	141279: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/380999932/medium.jpeg",
		attribution: "(c) Erick Vélez Sánchez, some rights reserved (CC BY)",
	}, // Tillandsia ionantha
	47848: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/611889809/medium.jpg",
		attribution: "no rights reserved",
	}, // Paphiopedilum
	128976: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/514438101/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Cymbidium
	430622: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/403833642/medium.jpeg",
		attribution: "(c) Colin Meurk, some rights reserved (CC BY)",
	}, // Aeschynanthus radicans
	410380: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/68116573/medium.jpg",
		attribution: "(c) northerly, some rights reserved (CC BY)",
	}, // Rhododendron simsii
	85469: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/38288102/medium.jpeg",
		attribution: "no rights reserved",
	}, // Thymus vulgaris
	78465: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/551062990/medium.jpg",
		attribution: "no rights reserved",
	}, // Petroselinum crispum
	59254: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/526306459/medium.jpg",
		attribution: "no rights reserved",
	}, // Allium schoenoprasum
	708697: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/470211945/medium.jpg",
		attribution: "(c) Oleksandr Shynder, some rights reserved (CC BY)",
	}, // Citrus × microcarpa
	57140: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/595382998/medium.jpg",
		attribution: "(c) zebedeugalinha, some rights reserved (CC BY)",
	}, // Olea europaea
	52646: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/116711568/medium.jpeg",
		attribution: "(c) Gianni Del Bufalo bygdb, some rights reserved (CC BY)",
	}, // Nepenthes
	52656: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/138284346/medium.jpeg",
		attribution: "(c) Michel Langeveld, some rights reserved (CC BY)",
	}, // Drosera capensis
	357658: {
		url: "https://inaturalist-open-data.s3.amazonaws.com/photos/455838420/medium.jpg",
		attribution: "(c) Oleksandr Shynder, some rights reserved (CC BY)",
	}, // Ehretia microphylla
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

// Popular holds as many as one iNaturalist request can return
const tabSize = (category: Category) => (category === "popular" ? 30 : 20);

export const categoryTaxonIds = (category: Category) =>
	CURATED_PLANTS.filter(matchesCategory[category])
		.slice(0, tabSize(category))
		.map((plant) => plant.taxonId);

export const curatedPlant = (taxonId: number) =>
	CURATED_PLANTS.find((plant) => plant.taxonId === taxonId);

const language = () => (locale() === "en" ? "en" : "fr");

export const usageName = (plant: CuratedPlant) => plant.names[language()];

// The names people use, like "Pothos", that iNaturalist may not know
export const searchCuratedPlants = (query: string) => {
	const needle = normalizeForSearch(query.trim());
	// From a word start only, or "ia" would list dozens of Latin names
	const matchesScientificName = (plant: CuratedPlant) =>
		` ${normalizeForSearch(plant.scientificName)}`.includes(` ${needle}`);
	return CURATED_PLANTS.filter(
		(plant) =>
			matchesScientificName(plant) ||
			[usageName(plant), ...plant.aliases[language()]].some((name) =>
				normalizeForSearch(name).includes(needle),
			),
	);
};
