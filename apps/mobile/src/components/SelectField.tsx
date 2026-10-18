import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import FieldButton from "@/components/FieldButton";
import OptionList, { type Option } from "@/components/OptionList";

type SelectFieldProps<T extends string> = {
	title: string;
	placeholder: string;
	options: Option<T>[];
	error?: string;
	disabled?: boolean;
} & (
	| { multiple?: false; value: T | null; onChange: (value: T | null) => void }
	| { multiple: true; value: T[]; onChange: (value: T[]) => void }
);

export default function SelectField<T extends string>(
	props: SelectFieldProps<T>,
) {
	const { title, placeholder, options, error, disabled } = props;
	const sheetRef = useRef<BottomSheetModal>(null);
	const selected = props.multiple ? props.value : [props.value];
	const summary = options
		.filter((option) => selected.includes(option.value))
		.map((option) => option.label)
		.join(", ");

	const toggle = (value: T) => {
		if (props.multiple) {
			props.onChange(
				props.value.includes(value)
					? props.value.filter((item) => item !== value)
					: // Keeps the options order, not the tap order
						options
							.map((option) => option.value)
							.filter((item) => item === value || props.value.includes(item)),
			);
			return;
		}
		// Tapping the selected option clears the field
		props.onChange(props.value === value ? null : value);
		sheetRef.current?.dismiss();
	};

	return (
		<>
			<FieldButton
				value={summary || null}
				placeholder={placeholder}
				icon="chevron-down-outline"
				accessibilityLabel={title}
				error={error}
				disabled={disabled}
				onPress={() => sheetRef.current?.present()}
				onClear={() =>
					props.multiple ? props.onChange([]) : props.onChange(null)
				}
			/>
			<BottomSheet
				ref={sheetRef}
				title={title}
				actions={
					props.multiple && (
						<Button
							title="Valider"
							onPress={() => sheetRef.current?.dismiss()}
						/>
					)
				}
			>
				<OptionList
					options={options}
					selected={selected}
					onPress={toggle}
					multiple={props.multiple}
				/>
			</BottomSheet>
		</>
	);
}
