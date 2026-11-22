import { useMemo } from "react";
import { View } from "react-native";
import Text from "@/components/Text";
import {
	type InlinePart,
	parseInline,
	parseMarkdown,
} from "@/features/articles/markdown";

const inlineClassNames: Record<InlinePart["style"], string | undefined> = {
	plain: undefined,
	bold: "font-outfit-semibold text-foreground",
	italic: "italic",
};

function InlineText({ text }: { text: string }) {
	return parseInline(text).map((part, index) => (
		<Text
			// The parts of a text never move
			// biome-ignore lint/suspicious/noArrayIndexKey: static content
			key={index}
			className={inlineClassNames[part.style]}
		>
			{part.text}
		</Text>
	));
}

const PARAGRAPH = "text-base leading-6 text-muted";

export function ArticleBody({ markdown }: { markdown: string }) {
	const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);

	return (
		<View className="gap-4">
			{blocks.map((block, index) => {
				// The blocks of an article never move
				const key = index;
				if (block.type === "heading") {
					return (
						<Text
							key={key}
							accessibilityRole="header"
							className="mt-2 font-recoleta text-xl text-foreground"
						>
							{block.text}
						</Text>
					);
				}
				if (block.type === "paragraph") {
					return (
						<Text key={key} className={PARAGRAPH}>
							<InlineText text={block.text} />
						</Text>
					);
				}
				return (
					<View key={key} className="gap-2">
						{block.items.map((item, itemIndex) => (
							// Two items can share a text, and the list never reorders
							// biome-ignore lint/suspicious/noArrayIndexKey: static content
							<View key={itemIndex} className="flex-row gap-2">
								<Text className={PARAGRAPH}>
									{block.ordered ? `${itemIndex + 1}.` : "•"}
								</Text>
								<Text className={`flex-1 ${PARAGRAPH}`}>
									<InlineText text={item} />
								</Text>
							</View>
						))}
					</View>
				);
			})}
		</View>
	);
}
