import type { Plant } from "@/features/plants/plantSchema";
import {
	needsWeatherPlace,
	weatherRisks,
} from "@/features/weather/weatherRisks";
import type { ForecastHour } from "@/features/weather/weatherTypes";

const plant = (id: string, overrides: Partial<Plant> = {}) =>
	({
		id,
		name: id,
		temperature: 2,
		outdoor: true,
		archivedAt: null,
		...overrides,
	}) as Plant;

const hour = (
	time: string,
	values: Partial<Omit<ForecastHour, "time">> = {},
): ForecastHour => ({
	time: `2026-11-20T${time}`,
	temperature: 15,
	gusts: 20,
	code: 1,
	...values,
});

const run = (hours: ForecastHour[], plants: Plant[]) =>
	weatherRisks({
		hours,
		plants,
		from: "2026-11-20T00:00",
		to: "2026-11-21T00:00",
	});

describe("weatherRisks", () => {
	it("warns the plants whose cold threshold is crossed, at the coldest hour", () => {
		const temperate = plant("basil", { temperature: 2 });
		const cool = plant("heather", { temperature: 1 });

		const [risk, ...others] = run(
			[
				hour("03:00", { temperature: 4 }),
				hour("05:00", { temperature: 3 }),
				hour("07:00", { temperature: 6 }),
			],
			[temperate, cool],
		);

		expect(others).toEqual([]);
		expect(risk).toEqual({
			kind: "cold",
			value: 3,
			at: "2026-11-20T05:00",
			plants: [temperate],
			shelter: false,
		});
	});

	it.each([
		[-2, 2, false],
		[-4, 2, true],
		[8, 3, true],
	])(
		"at %i °C with a plant of need %i, shelters it: %s",
		(temperature, need, shelter) => {
			const [risk] = run(
				[hour("05:00", { temperature })],
				[plant("lemon", { temperature: need })],
			);
			expect(risk?.shelter).toBe(shelter);
		},
	);

	it("warns of heat above 35 °C only", () => {
		expect(run([hour("15:00", { temperature: 35 })], [plant("basil")])).toEqual(
			[],
		);
		const [risk] = run(
			[hour("14:00", { temperature: 36 }), hour("15:00", { temperature: 38 })],
			[plant("basil")],
		);
		expect(risk).toMatchObject({
			kind: "heat",
			value: 38,
			at: "2026-11-20T15:00",
		});
	});

	it("warns of the first thunderstorm, whatever its kind", () => {
		expect(run([hour("18:00", { code: 3 })], [plant("basil")])).toEqual([]);
		const [risk] = run(
			[hour("18:00", { code: 96 }), hour("19:00", { code: 95 })],
			[plant("basil")],
		);
		expect(risk).toMatchObject({ kind: "storm", at: "2026-11-20T18:00" });
	});

	it("warns of gusts from 60 km/h", () => {
		expect(run([hour("12:00", { gusts: 59 })], [plant("basil")])).toEqual([]);
		const [risk] = run([hour("12:00", { gusts: 60 })], [plant("basil")]);
		expect(risk).toMatchObject({ kind: "wind", value: 60 });
	});

	it("only looks at the hours of the window", () => {
		expect(
			weatherRisks({
				hours: [
					hour("05:00", { temperature: -5 }),
					hour("23:00", { gusts: 80 }),
				],
				plants: [plant("basil")],
				from: "2026-11-20T06:00",
				to: "2026-11-20T23:00",
			}),
		).toEqual([]);
	});

	it("lists the risks from cold to wind", () => {
		const risks = run(
			[
				hour("02:00", { gusts: 70 }),
				hour("03:00", { code: 95 }),
				hour("05:00", { temperature: -1 }),
				hour("15:00", { temperature: 37 }),
			],
			[plant("basil")],
		);
		expect(risks.map((risk) => risk.kind)).toEqual([
			"cold",
			"heat",
			"storm",
			"wind",
		]);
	});

	it("ignores the indoor and past plants", () => {
		expect(
			run(
				[hour("05:00", { temperature: -5 }), hour("12:00", { gusts: 90 })],
				[
					plant("ficus", { outdoor: false }),
					plant("olive", { archivedAt: "2026-11-01T00:00:00.000Z" }),
				],
			),
		).toEqual([]);
	});
});

describe("needsWeatherPlace", () => {
	const lyon = { name: "Lyon, France", latitude: 45.8, longitude: 4.8 };

	it("asks for a place once an outdoor plant needs the alerts", () => {
		expect(
			needsWeatherPlace({
				alertsEnabled: true,
				place: null,
				plants: [plant("basil")],
			}),
		).toBe(true);
	});

	it.each([
		[
			"a place is known",
			{ alertsEnabled: true, place: lyon, plants: [plant("basil")] },
		],
		[
			"the alerts are off",
			{ alertsEnabled: false, place: null, plants: [plant("basil")] },
		],
		[
			"no plant is outdoor",
			{
				alertsEnabled: true,
				place: null,
				plants: [plant("ficus", { outdoor: false })],
			},
		],
	])("asks nothing when %s", (_, input) => {
		expect(needsWeatherPlace(input)).toBe(false);
	});
});
