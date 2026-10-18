import { displayName } from "@/features/plants/plantLabels";

describe("displayName", () => {
	it("quotes the nickname", () => {
		expect(displayName({ nickname: "Raven", name: "Zamioculcas" })).toBe(
			"“Raven”",
		);
	});

	it("falls back to the name", () => {
		expect(displayName({ nickname: null, name: "Monstera" })).toBe("Monstera");
	});
});
