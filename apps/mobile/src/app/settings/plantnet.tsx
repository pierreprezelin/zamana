import { useHeaderHeight } from "expo-router/react-navigation";
import { type ReactNode, useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import Button from "@/components/Button";
import CreditLink from "@/components/CreditLink";
import FieldInput from "@/components/FieldInput";
import FieldLabel from "@/components/FieldLabel";
import { Ionicons, type IoniconsIconName } from "@/components/ionicons";
import StickyActionBar from "@/components/StickyActionBar";
import Text from "@/components/Text";
import { LimitedInfoNote } from "@/features/encyclopedia/components/LimitedInfoNote";
import { maskKey } from "@/features/identification/apiKey";
import {
	fetchDailyQuota,
	PlantNetError,
	type PlantNetErrorKind,
} from "@/features/identification/plantnet";
import {
	isExhausted,
	nextReset,
	type Quota,
	todayQuota,
} from "@/features/identification/quota";
import { usePlantNetStore } from "@/features/identification/usePlantNetStore";
import { locale, t } from "@/utils/i18n";
import { showErrorToast } from "@/utils/toast";

const ACCOUNT_URL = "https://my.plantnet.org/";
// Shaped like a real key, to show what to paste
const KEY_EXAMPLE = "2b10AbCdEfGhIjKlMnOpQrSt";

type TestResult =
	| "valid"
	| Extract<PlantNetErrorKind, "invalidKey" | "offline" | "unknown">;
type TestStatus = "testing" | TestResult;

// One line whatever the status, so that the content below does not move
const testFeedback: Record<
	TestStatus,
	{ icon: IoniconsIconName; className: string }
> = {
	testing: { icon: "sync-outline", className: "text-muted" },
	valid: { icon: "checkmark-circle", className: "text-success" },
	invalidKey: { icon: "close-circle", className: "text-danger" },
	offline: { icon: "cloud-offline-outline", className: "text-muted" },
	unknown: { icon: "alert-circle-outline", className: "text-danger" },
};

export default function PlantNetSettingsScreen() {
	const headerHeight = useHeaderHeight();
	const apiKey = usePlantNetStore((state) => state.apiKey);
	const quota = todayQuota(
		usePlantNetStore((state) => state.quota),
		new Date(),
	);
	const [draft, setDraft] = useState("");
	const [formatError, setFormatError] = useState(false);
	const [status, setStatus] = useState<TestStatus>("testing");

	// The key may have been deleted or replaced while it was tested
	const test = async (key: string) => {
		setStatus("testing");
		const stillCurrent = () => usePlantNetStore.getState().apiKey === key;
		try {
			const quota = await fetchDailyQuota(key);
			if (!stillCurrent()) return;
			usePlantNetStore.getState().setQuota(quota);
			setStatus("valid");
		} catch (error) {
			if (!stillCurrent()) return;
			const kind = error instanceof PlantNetError ? error.kind : "unknown";
			setStatus(kind === "invalidKey" || kind === "offline" ? kind : "unknown");
		}
	};

	// The quota moves with every identification, even from another device
	// biome-ignore lint/correctness/useExhaustiveDependencies: refreshed once, on opening
	useEffect(() => {
		if (apiKey) test(apiKey);
	}, []);

	const save = () => {
		const saved = usePlantNetStore.getState().setApiKey(draft);
		setFormatError(saved === "invalid");
		if (saved === "failed") showErrorToast(t("common.saveFailed"));
		if (saved !== "saved") return;
		setDraft("");
		const key = usePlantNetStore.getState().apiKey;
		if (key) test(key);
	};

	const feedback = testFeedback[status];

	return (
		<KeyboardAvoidingView
			behavior="padding"
			keyboardVerticalOffset={headerHeight}
			className="flex-1"
		>
			<ScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerClassName="gap-6 p-4"
			>
				<Text className="text-muted">{t("identification.settings.intro")}</Text>

				{!apiKey && (
					<View className="gap-3">
						<Step number={1} text={t("identification.settings.stepAccount")}>
							<CreditLink
								label={t("identification.settings.openAccount")}
								url={ACCOUNT_URL}
								textClassName="text-primary"
							/>
						</Step>
						<Step number={2} text={t("identification.settings.stepPaste")} />
					</View>
				)}

				<View>
					<FieldLabel>{t("identification.settings.keyLabel")}</FieldLabel>
					{apiKey ? (
						<View className="gap-1">
							<View
								accessible
								accessibilityLabel={`${t("identification.settings.keyLabel")}, ${maskKey(apiKey)}`}
								className="h-12 flex-row items-center justify-between rounded-xl bg-primary-tint px-4"
							>
								<Text className="text-sm text-muted">{maskKey(apiKey)}</Text>
								<Ionicons
									name="lock-closed-outline"
									size={16}
									className="text-muted"
								/>
							</View>
							<Text className="text-xs text-muted">
								{t("identification.settings.keyHidden")}
							</Text>
						</View>
					) : (
						<FieldInput
							value={draft}
							onChangeText={(text) => {
								setDraft(text);
								setFormatError(false);
							}}
							placeholder={KEY_EXAMPLE}
							accessibilityLabel={t("identification.settings.keyLabel")}
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="off"
							secureTextEntry
							maxLength={100}
							returnKeyType="done"
							onSubmitEditing={save}
							error={
								formatError
									? t("identification.settings.invalidFormat")
									: undefined
							}
						/>
					)}
				</View>

				{apiKey && (
					<View className="gap-4">
						{quota && <QuotaGauge quota={quota} />}
						<View className="flex-row items-center gap-2">
							<Ionicons
								name={feedback.icon}
								size={18}
								className={feedback.className}
							/>
							<Text className={`flex-1 ${feedback.className}`}>
								{t(`identification.settings.test.${status}`)}
							</Text>
						</View>
					</View>
				)}

				<LimitedInfoNote message={t("identification.settings.privacy")} />
			</ScrollView>

			<StickyActionBar>
				{apiKey ? (
					<>
						<Button
							icon="pulse-outline"
							title={t("identification.settings.testKey")}
							loading={status === "testing"}
							onPress={() => test(apiKey)}
						/>
						<Button
							variant="ghostDanger"
							title={t("identification.settings.deleteKey")}
							onPress={async () => {
								try {
									await usePlantNetStore.getState().clearApiKey();
								} catch {
									showErrorToast(t("identification.settings.deleteFailed"));
								}
							}}
						/>
					</>
				) : (
					<Button
						title={t("identification.settings.saveKey")}
						disabled={!draft.trim()}
						onPress={save}
					/>
				)}
			</StickyActionBar>
		</KeyboardAvoidingView>
	);
}

function Step({
	number,
	text,
	children,
}: {
	number: number;
	text: string;
	children?: ReactNode;
}) {
	return (
		<View className="flex-row gap-3">
			<View className="size-6 items-center justify-center rounded-full bg-primary-tint">
				<Text className="font-outfit-semibold text-xs text-primary">
					{number}
				</Text>
			</View>
			<View className="flex-1 items-start gap-1">
				<Text className="text-foreground">{text}</Text>
				{children}
			</View>
		</View>
	);
}

function QuotaGauge({ quota }: { quota: Quota }) {
	const exhausted = isExhausted(quota);
	const used = quota.total > 0 ? Math.min(1, quota.count / quota.total) : 1;
	const resetAt = nextReset(new Date()).toLocaleTimeString(locale(), {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<View className="gap-2">
			<View className="flex-row justify-between gap-4">
				<Text className="font-outfit-semibold text-foreground">
					{t("identification.settings.quotaCount", {
						count: quota.count,
						total: quota.total,
					})}
				</Text>
				<Text className={exhausted ? "text-danger" : "text-muted"}>
					{exhausted
						? t("identification.settings.quotaExhausted")
						: t("identification.settings.quotaRemaining", {
								remaining: quota.remaining,
							})}
				</Text>
			</View>
			<View
				accessible
				accessibilityRole="progressbar"
				accessibilityValue={{ min: 0, max: quota.total, now: quota.count }}
				className="h-2 overflow-hidden rounded-full bg-primary-tint"
			>
				<View
					className={`h-full rounded-full ${exhausted ? "bg-danger" : "bg-primary"}`}
					style={{ width: `${used * 100}%` }}
				/>
			</View>
			<Text className="text-xs text-muted">
				{t("identification.settings.quotaReset", { time: resetAt })}
			</Text>
		</View>
	);
}
