import { parseInline, parseMarkdown } from "@/features/articles/markdown";

describe("parseMarkdown", () => {
	it("splits headings and paragraphs on blank lines", () => {
		expect(
			parseMarkdown("Intro on\ntwo lines.\n\n## A heading\n\nA paragraph."),
		).toEqual([
			{ type: "paragraph", text: "Intro on two lines." },
			{ type: "heading", text: "A heading" },
			{ type: "paragraph", text: "A paragraph." },
		]);
	});

	it("reads bulleted and numbered lists", () => {
		expect(
			parseMarkdown("- one;\n- two.\n\n1. **First** step.\n2. Second step."),
		).toEqual([
			{ type: "list", ordered: false, items: ["one;", "two."] },
			{
				type: "list",
				ordered: true,
				items: ["**First** step.", "Second step."],
			},
		]);
	});

	it("keeps a list right after a paragraph apart", () => {
		expect(parseMarkdown("At noon:\n\n- sharp shadow")).toEqual([
			{ type: "paragraph", text: "At noon:" },
			{ type: "list", ordered: false, items: ["sharp shadow"] },
		]);
	});

	it("ignores extra blank lines", () => {
		expect(parseMarkdown("\n\nText.\n\n\n")).toEqual([
			{ type: "paragraph", text: "Text." },
		]);
	});
});

describe("parseInline", () => {
	it("marks bold and italic parts", () => {
		expect(parseInline("A **bold** and _italic_ word.")).toEqual([
			{ text: "A ", style: "plain" },
			{ text: "bold", style: "bold" },
			{ text: " and ", style: "plain" },
			{ text: "italic", style: "italic" },
			{ text: " word.", style: "plain" },
		]);
	});

	it("leaves plain text as one part", () => {
		expect(parseInline("70% rubbing alcohol")).toEqual([
			{ text: "70% rubbing alcohol", style: "plain" },
		]);
	});
});
