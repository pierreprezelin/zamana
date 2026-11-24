import {
	historyEntrySchema,
	NOTE_MAX_LENGTH,
} from "@/features/history/historySchema";

describe("historyEntrySchema", () => {
	it("accepts a photo alone", () => {
		expect(historyEntrySchema.parse({ photo: "a.jpg", note: "" })).toEqual({
			photo: "a.jpg",
			note: null,
		});
	});

	it("accepts a trimmed note alone", () => {
		expect(
			historyEntrySchema.parse({ photo: null, note: "  New leaf " }),
		).toEqual({ photo: null, note: "New leaf" });
	});

	it("rejects an entry without photo nor note, blank notes included", () => {
		expect(
			historyEntrySchema.safeParse({ photo: null, note: "   " }).success,
		).toBe(false);
	});

	it("rejects a note over the limit", () => {
		const note = "a".repeat(NOTE_MAX_LENGTH + 1);
		expect(historyEntrySchema.safeParse({ photo: null, note }).success).toBe(
			false,
		);
	});
});
