import Text from "@/components/Text";
import { t } from "@/utils/i18n";

const NEAR_LIMIT_RATIO = 0.8;

export const isNearLimit = (length: number, max: number) =>
	length >= max * NEAR_LIMIT_RATIO;

type CharacterCountProps = {
	length: number;
	max: number;
	className?: string;
};

export default function CharacterCount({
	length,
	max,
	className = "",
}: CharacterCountProps) {
	return (
		<Text
			className={`text-xs ${length >= max ? "text-danger" : "text-muted"} ${className}`}
		>
			{t("common.characterCount", { length, max })}
		</Text>
	);
}
