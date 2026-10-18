import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { type ComponentRef, type ReactNode, useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AccordionSection from "@/components/AccordionSection";
import Button from "@/components/Button";
import DateField from "@/components/DateField";
import FieldInput from "@/components/FieldInput";
import FieldLabel from "@/components/FieldLabel";
import { Ionicons } from "@/components/ionicons";
import Pressable from "@/components/Pressable";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import Text from "@/components/Text";
import Toggle from "@/components/Toggle";
import { resolveBornAt } from "@/features/plants/age";
import { DeletePlantSheet } from "@/features/plants/components/DeletePlantSheet";
import { HelpSheet } from "@/features/plants/components/HelpSheet";
import { PhotoPicker } from "@/features/plants/components/PhotoPicker";
import {
	type FormErrors,
	type FormField,
	type FormSection,
	firstErrorField,
	formErrors,
	initialFormState,
	type PlantFormState,
	SECTION_FIELDS,
	toFormValues,
} from "@/features/plants/plantForm";
import { displayName } from "@/features/plants/plantLabels";
import {
	ageUnitOptions,
	floweringTypeHelp,
	floweringTypeOptions,
	lifespanHelp,
	lifespanOptions,
	locationOptions,
	needs,
	originOptions,
	plantTypeOptions,
	seasonOptions,
} from "@/features/plants/plantOptions";
import { savePhoto } from "@/features/plants/plantPhoto";
import {
	NAME_MAX_LENGTH,
	NICKNAME_MAX_LENGTH,
	NOTES_MAX_LENGTH,
	type Plant,
	plantInputSchema,
	SCIENTIFIC_NAME_MAX_LENGTH,
} from "@/features/plants/plantSchema";
import { usePlantStore } from "@/features/plants/usePlantStore";

type ViewRef = ComponentRef<typeof View>;

const LEVEL_VALUES = ["1", "2", "3"] as const;
const SCROLL_MARGIN = 16;

type LabeledFieldProps = {
	label: string;
	helper?: string;
	helperClassName?: string;
	onInfoPress?: () => void;
	fieldRef?: (view: ViewRef | null) => void;
	children: ReactNode;
};

function LabeledField({
	label,
	helper,
	helperClassName = "text-muted",
	onInfoPress,
	fieldRef,
	children,
}: LabeledFieldProps) {
	return (
		<View ref={fieldRef}>
			<View className="flex-row items-center gap-1.5">
				<FieldLabel>{label}</FieldLabel>
				{onInfoPress && (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`En savoir plus : ${label}`}
						pressedClassName=""
						pressedOpacity={0.5}
						hitSlop={12}
						onPress={onInfoPress}
						className="mb-2"
					>
						<Ionicons
							name="information-circle-outline"
							size={18}
							className="text-foreground"
						/>
					</Pressable>
				)}
			</View>
			{children}
			{helper && (
				<Text className={`mt-2 text-xs ${helperClassName}`}>{helper}</Text>
			)}
		</View>
	);
}

type ToggleRowProps = {
	label: string;
	helper?: string;
	value: boolean;
	onChange: (value: boolean) => void;
};

function ToggleRow({ label, helper, value, onChange }: ToggleRowProps) {
	return (
		<View className="flex-row items-center gap-4">
			<View className="flex-1">
				<Text className="font-outfit-semibold text-foreground">{label}</Text>
				{helper && <Text className="text-xs text-muted">{helper}</Text>}
			</View>
			<Toggle accessibilityLabel={label} value={value} onChange={onChange} />
		</View>
	);
}

export function PlantForm({ plant }: { plant?: Plant }) {
	const createPlant = usePlantStore((state) => state.createPlant);
	const updatePlant = usePlantStore((state) => state.updatePlant);
	const headerHeight = useHeaderHeight();
	const { bottom } = useSafeAreaInsets();
	const [initialState] = useState(() => initialFormState(plant, new Date()));
	const [form, setForm] = useState(initialState);
	const [errors, setErrors] = useState<FormErrors>({});
	const [saving, setSaving] = useState(false);
	const [expanded, setExpanded] = useState<Record<FormSection, boolean>>({
		details: false,
		needs: false,
		lifecycle: false,
		notes: false,
	});
	const [help, setHelp] = useState(floweringTypeHelp);
	const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
	const contentRef = useRef<ViewRef>(null);
	const fieldRefs = useRef<Partial<Record<FormField, ViewRef | null>>>({});
	const helpSheetRef = useRef<BottomSheetModal>(null);
	const deleteSheetRef = useRef<BottomSheetModal>(null);

	const update = <K extends FormField>(field: K, value: PlantFormState[K]) => {
		setForm((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	};

	const fieldRef = (field: FormField) => (view: ViewRef | null) => {
		fieldRefs.current[field] = view;
	};

	const toggleSection = (section: FormSection) =>
		setExpanded((current) => ({ ...current, [section]: !current[section] }));

	const showHelp = (content: typeof help) => {
		setHelp(content);
		helpSheetRef.current?.present();
	};

	const scrollToField = (field: FormField) =>
		// Waits for the sections opened by the errors to be laid out
		requestAnimationFrame(() => {
			const content = contentRef.current;
			if (!content) return;
			fieldRefs.current[field]?.measureLayout(content, (_x, y) =>
				scrollRef.current?.scrollTo({ y: Math.max(y - SCROLL_MARGIN, 0) }),
			);
		});

	const showErrors = (newErrors: FormErrors) => {
		setErrors(newErrors);
		setExpanded((current) => {
			const next = { ...current };
			for (const section of Object.keys(SECTION_FIELDS) as FormSection[]) {
				if (SECTION_FIELDS[section].some((field) => newErrors[field])) {
					next[section] = true;
				}
			}
			return next;
		});
		const firstField = firstErrorField(newErrors);
		if (firstField) scrollToField(firstField);
	};

	const submit = async () => {
		const result = plantInputSchema.safeParse(toFormValues(form));
		if (!result.success) {
			showErrors(formErrors(result.error));
			return;
		}

		setSaving(true);
		try {
			const { age, ...input } = result.data;
			const photo =
				form.photoUri === initialState.photoUri
					? (plant?.photo ?? null)
					: form.photoUri && (await savePhoto(form.photoUri));
			const data = {
				...input,
				photo,
				bornAt: resolveBornAt(age, plant?.bornAt ?? null, new Date()),
			};

			if (plant) {
				await updatePlant(plant.id, data);
			} else {
				await createPlant(data);
			}
			router.back();
			Toast.show({
				type: "success",
				text1: plant
					? "Les informations ont bien été enregistrées ! 🎉"
					: `${displayName(data)} a rejoint votre jardin ! 🌱`,
			});
		} catch {
			Toast.show({
				type: "error",
				text1: "L'enregistrement a échoué, réessayez",
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior="padding"
			keyboardVerticalOffset={headerHeight}
			className="flex-1"
		>
			<ScrollView
				ref={scrollRef}
				keyboardShouldPersistTaps="handled"
				// With the action bar padding, ends 32px above the button like the gap between sections
				contentContainerClassName="px-5 pb-5.5"
			>
				<View ref={contentRef} className="gap-8">
					<View className="gap-4">
						<Text className="font-recoleta text-xl text-foreground">Photo</Text>
						<PhotoPicker
							uri={form.photoUri}
							onChange={(uri) => update("photoUri", uri)}
						/>
					</View>

					<View className="gap-4">
						<Text className="font-recoleta text-xl text-foreground">
							Identité
						</Text>
						<LabeledField label="Surnom" fieldRef={fieldRef("nickname")}>
							<FieldInput
								accessibilityLabel="Surnom"
								placeholder="Ex : Raven"
								value={form.nickname}
								onChangeText={(text) => update("nickname", text)}
								error={errors.nickname}
								maxLength={NICKNAME_MAX_LENGTH}
								autoCapitalize="words"
							/>
						</LabeledField>
						<LabeledField label="Nom *" fieldRef={fieldRef("name")}>
							<FieldInput
								accessibilityLabel="Nom"
								placeholder="Ex : Zamioculcas"
								value={form.name}
								onChangeText={(text) => update("name", text)}
								error={errors.name}
								maxLength={NAME_MAX_LENGTH}
								autoCapitalize="sentences"
							/>
						</LabeledField>
						<LabeledField label="Type" fieldRef={fieldRef("type")}>
							<SelectField
								title="Type"
								placeholder="Choisir un type"
								options={plantTypeOptions}
								value={form.type}
								onChange={(value) => update("type", value)}
								error={errors.type}
							/>
						</LabeledField>
					</View>

					<View className="gap-2">
						<Text className="pb-1 font-recoleta text-xl text-foreground">
							Informations
						</Text>

						<AccordionSection
							title="Détails"
							summary="Nom scientifique, origine, date d’acquisition, emplacement, âge"
							expanded={expanded.details}
							onToggle={() => toggleSection("details")}
						>
							<LabeledField
								label="Nom scientifique"
								fieldRef={fieldRef("scientificName")}
							>
								<FieldInput
									accessibilityLabel="Nom scientifique"
									placeholder="Ex : Zamioculcas zamiifolia"
									value={form.scientificName}
									onChangeText={(text) => update("scientificName", text)}
									error={errors.scientificName}
									maxLength={SCIENTIFIC_NAME_MAX_LENGTH}
									autoCapitalize="sentences"
									autoCorrect={false}
								/>
							</LabeledField>
							<LabeledField label="Origine" fieldRef={fieldRef("origin")}>
								<SelectField
									title="Origine"
									placeholder="Choisir une origine"
									options={originOptions}
									value={form.origin}
									onChange={(value) => update("origin", value)}
									error={errors.origin}
								/>
							</LabeledField>
							<LabeledField
								label="Date d’acquisition"
								fieldRef={fieldRef("acquiredAt")}
							>
								<DateField
									title="Date d’acquisition"
									placeholder="Choisir une date"
									value={form.acquiredAt}
									onChange={(value) => update("acquiredAt", value)}
									error={errors.acquiredAt}
								/>
							</LabeledField>
							<LabeledField
								label="Emplacement"
								helper={
									form.outdoor
										? "Indisponible pour une plante d’extérieur (voir Besoins)."
										: undefined
								}
								helperClassName="text-warning"
								fieldRef={fieldRef("location")}
							>
								<SelectField
									title="Emplacement"
									placeholder="Choisir une pièce"
									options={locationOptions}
									value={form.outdoor ? null : form.location}
									onChange={(value) => update("location", value)}
									error={errors.location}
									disabled={form.outdoor}
								/>
							</LabeledField>
							<LabeledField label="Âge" fieldRef={fieldRef("ageAmount")}>
								<View className="flex-row items-start gap-2">
									<View className="w-22">
										<FieldInput
											accessibilityLabel="Âge"
											placeholder="Ex : 3"
											value={form.ageAmount}
											onChangeText={(text) => update("ageAmount", text)}
											keyboardType="number-pad"
											maxLength={3}
											className={errors.ageAmount ? "border-danger" : undefined}
										/>
									</View>
									<View className="flex-1">
										<SegmentedControl
											className="h-12"
											options={ageUnitOptions}
											value={form.ageUnit}
											onChange={(unit) => update("ageUnit", unit)}
										/>
									</View>
								</View>
								{errors.ageAmount && (
									<Text className="mt-1 text-xs text-danger">
										{errors.ageAmount}
									</Text>
								)}
							</LabeledField>
						</AccordionSection>

						<AccordionSection
							title="Besoins"
							summary="Lumière, arrosage, température, humidité, extérieur, toxicité"
							expanded={expanded.needs}
							onToggle={() => toggleSection("needs")}
						>
							{needs.map((need) => (
								<LabeledField
									key={need.key}
									label={need.label}
									helper={need.helper}
								>
									<SegmentedControl
										options={LEVEL_VALUES.map((value, index) => ({
											value,
											label: need.levels[index],
										}))}
										value={LEVEL_VALUES[form[need.key] - 1]}
										onChange={(value) => update(need.key, Number(value))}
									/>
								</LabeledField>
							))}
							<ToggleRow
								label="Plante d’extérieur"
								helper="Active les alertes météo (gel, canicule)."
								value={form.outdoor}
								onChange={(value) => update("outdoor", value)}
							/>
							<ToggleRow
								label="Toxicité pour les animaux"
								value={form.toxic}
								onChange={(value) => update("toxic", value)}
							/>
						</AccordionSection>

						<AccordionSection
							title="Cycle de vie"
							summary="Floraison, type de floraison, durée de vie"
							expanded={expanded.lifecycle}
							onToggle={() => toggleSection("lifecycle")}
						>
							<LabeledField label="Floraison">
								<SelectField
									multiple
									title="Floraison"
									placeholder="Choisir les saisons"
									options={seasonOptions}
									value={form.floweringSeasons}
									onChange={(value) => update("floweringSeasons", value)}
								/>
							</LabeledField>
							<LabeledField
								label="Type de floraison"
								onInfoPress={() => showHelp(floweringTypeHelp)}
							>
								<SelectField
									title="Type de floraison"
									placeholder="Choisir un type de floraison"
									options={floweringTypeOptions}
									value={form.floweringType}
									onChange={(value) => update("floweringType", value)}
								/>
							</LabeledField>
							<LabeledField
								label="Durée de vie"
								onInfoPress={() => showHelp(lifespanHelp)}
							>
								<SelectField
									title="Durée de vie"
									placeholder="Choisir une durée de vie"
									options={lifespanOptions}
									value={form.lifespan}
									onChange={(value) => update("lifespan", value)}
								/>
							</LabeledField>
						</AccordionSection>

						<AccordionSection
							title="Notes"
							summary="Anecdotes, conseils, particularités"
							expanded={expanded.notes}
							onToggle={() => toggleSection("notes")}
						>
							<View ref={fieldRef("notes")}>
								<FieldInput
									accessibilityLabel="Notes"
									placeholder="Ex : Offerte pour mon anniversaire, à tourner vers la fenêtre de temps en temps."
									value={form.notes}
									onChangeText={(text) => update("notes", text)}
									error={errors.notes}
									maxLength={NOTES_MAX_LENGTH}
									multiline
									textAlignVertical="top"
									className="h-40 py-3"
								/>
								<Text
									className={`mt-1 text-right text-xs ${form.notes.length >= NOTES_MAX_LENGTH ? "text-danger" : "text-muted"}`}
								>
									{form.notes.length} / {NOTES_MAX_LENGTH} caractères
								</Text>
							</View>
						</AccordionSection>
					</View>
				</View>
			</ScrollView>

			<View
				className="gap-2 bg-background px-5 pt-2.5"
				style={{ paddingBottom: bottom }}
			>
				<Button
					title={plant ? "Enregistrer" : "Ajouter la plante"}
					loading={saving}
					onPress={submit}
				/>
				{plant && (
					<Button
						variant="ghostDanger"
						title="Supprimer la plante"
						onPress={() => deleteSheetRef.current?.present()}
					/>
				)}
			</View>

			<HelpSheet ref={helpSheetRef} help={help} />
			{plant && (
				<DeletePlantSheet
					ref={deleteSheetRef}
					plant={plant}
					onCancel={() => deleteSheetRef.current?.dismiss()}
				/>
			)}
		</KeyboardAvoidingView>
	);
}
