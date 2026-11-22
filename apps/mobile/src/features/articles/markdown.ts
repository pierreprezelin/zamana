// The Markdown subset of the help articles: headings, paragraphs, lists, bold and italic
export type Block =
	| { type: "heading"; text: string }
	| { type: "paragraph"; text: string }
	| { type: "list"; ordered: boolean; items: string[] };

export type InlinePart = { text: string; style: "plain" | "bold" | "italic" };

const BULLET = /^- /;
const NUMBER = /^\d+\. /;
const HEADING = /^#{2,3} /;

const toBlock = (lines: string[]): Block => {
	const [first] = lines;
	if (HEADING.test(first))
		return { type: "heading", text: first.replace(HEADING, "") };
	const ordered = NUMBER.test(first);
	if (ordered || BULLET.test(first)) {
		const marker = ordered ? NUMBER : BULLET;
		return {
			type: "list",
			ordered,
			items: lines.map((line) => line.replace(marker, "")),
		};
	}
	return { type: "paragraph", text: lines.join(" ") };
};

export const parseMarkdown = (markdown: string): Block[] =>
	markdown
		.split(/\n\s*\n/)
		.map((chunk) =>
			chunk
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean),
		)
		.filter((lines) => lines.length > 0)
		.map(toBlock);

export const parseInline = (text: string): InlinePart[] =>
	text
		.split(/(\*\*[^*]+\*\*|_[^_]+_)/)
		.filter(Boolean)
		.map((part) => {
			if (part.startsWith("**") && part.endsWith("**"))
				return { text: part.slice(2, -2), style: "bold" };
			if (part.length > 2 && part.startsWith("_") && part.endsWith("_"))
				return { text: part.slice(1, -1), style: "italic" };
			return { text: part, style: "plain" };
		});
