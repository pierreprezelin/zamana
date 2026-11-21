import { useEffect, useState } from "react";
import { View } from "react-native";
import Button from "@/components/Button";
import FieldLabel from "@/components/FieldLabel";
import { Ionicons } from "@/components/ionicons";
import OptionList from "@/components/OptionList";
import SearchField from "@/components/SearchField";
import SegmentedControl from "@/components/SegmentedControl";
import Text from "@/components/Text";
import WarningBanner from "@/components/WarningBanner";
import {
	formatReminderTime,
	toReminderTime,
} from "@/features/notifications/reminderTime";
import { usePlantStore } from "@/features/plants/usePlantStore";
import { switchToDevicePlace } from "@/features/weather/devicePlace";
import { searchCities } from "@/features/weather/openMeteo";
import { useLocationPermissionStore } from "@/features/weather/useLocationPermissionStore";
import {
	type PlaceSource,
	useWeatherStore,
} from "@/features/weather/useWeatherStore";
import { alertedPlants } from "@/features/weather/weatherRisks";
import type { Place } from "@/features/weather/weatherTypes";
import { t } from "@/utils/i18n";

const SEARCH_DELAY_MS = 400;
const SEARCH_MIN_LENGTH = 2;

const sourceOptions: { value: PlaceSource; label: string }[] = [
	{ value: "device", label: t("weather.settings.device") },
	{ value: "city", label: t("weather.settings.city") },
];

const timeOf = (iso: string) =>
	formatReminderTime(toReminderTime(new Date(iso)));

const useCitySearch = (query: string) => {
	const [results, setResults] = useState<Place[] | null>(null);

	useEffect(() => {
		if (query.trim().length < SEARCH_MIN_LENGTH) {
			setResults(null);
			return;
		}
		let current = true;
		const timer = setTimeout(() => {
			searchCities(query.trim())
				.then((places) => current && setResults(places))
				.catch(() => current && setResults([]));
		}, SEARCH_DELAY_MS);
		return () => {
			current = false;
			clearTimeout(timer);
		};
	}, [query]);

	return results;
};

function ForecastStatus({ switching }: { switching: boolean }) {
	const forecast = useWeatherStore((state) => state.forecast);
	const failedAt = useWeatherStore((state) => state.failedAt);
	const place = useWeatherStore((state) => state.place);
	const alertsEnabled = useWeatherStore((state) => state.alertsEnabled);
	const plants = usePlantStore((state) => state.plants);
	// Without an outdoor plant, no forecast is ever fetched: nothing to wait for
	const fetching =
		alertsEnabled &&
		alertedPlants(plants).length > 0 &&
		place !== null &&
		!forecast &&
		!failedAt;

	if (switching || fetching) {
		return (
			<Text className="text-xs text-muted">
				{t("weather.settings.loading")}
			</Text>
		);
	}

	if (failedAt && (!forecast || failedAt > forecast.fetchedAt)) {
		return (
			<Text className="text-xs text-danger">
				{t("weather.settings.failedSince", { time: timeOf(failedAt) })}
			</Text>
		);
	}
	if (!forecast) return null;
	return (
		<Text className="text-xs text-muted">
			{t("weather.settings.updatedAt", { time: timeOf(forecast.fetchedAt) })}
		</Text>
	);
}

function CitySearch() {
	const [query, setQuery] = useState("");
	const results = useCitySearch(query);
	const setCity = useWeatherStore((state) => state.setCity);

	return (
		<View className="gap-2">
			<SearchField
				value={query}
				onChangeText={setQuery}
				placeholder={t("weather.settings.searchPlaceholder")}
			/>
			{results?.length === 0 && (
				<Text className="text-xs text-muted">
					{t("weather.settings.noResult")}
				</Text>
			)}
			{results && results.length > 0 && (
				<OptionList
					options={results.map((place, index) => ({
						value: String(index),
						label: place.name,
					}))}
					selected={[]}
					onPress={(index) => {
						setCity(results[Number(index)]);
						setQuery("");
					}}
				/>
			)}
		</View>
	);
}

// Where the forecast is read, and how recent it is
export function WeatherPlaceSettings() {
	const source = useWeatherStore((state) => state.source);
	const place = useWeatherStore((state) => state.place);
	const permission = useLocationPermissionStore();
	const [mode, setMode] = useState<PlaceSource>(source);
	const [switching, setSwitching] = useState(false);

	useEffect(() => {
		permission.refresh();
	}, [permission.refresh]);

	// The chosen city stays until the position can replace it
	const followDevice = async () => {
		if (useLocationPermissionStore.getState().status !== "granted") {
			await permission.request();
		}
		setSwitching(true);
		await switchToDevicePlace().finally(() => setSwitching(false));
	};

	// Never asked yet or refused: the position can only come from this button
	const needsPermission =
		mode === "device" &&
		permission.status !== null &&
		permission.status !== "granted";

	return (
		<View className="gap-3">
			<View>
				<FieldLabel>{t("weather.settings.place")}</FieldLabel>
				<SegmentedControl
					options={sourceOptions}
					value={mode}
					onChange={(value) => {
						setMode(value);
						if (value === "device") followDevice();
					}}
				/>
			</View>
			{needsPermission && (
				<WarningBanner
					icon="location-outline"
					message={t(
						permission.status === "denied"
							? "weather.settings.denied"
							: "weather.settings.ask",
					)}
					action={
						<Button
							title={t(
								permission.canAskAgain
									? "weather.settings.allow"
									: "weather.settings.openSettings",
							)}
							className="h-9"
							onPress={followDevice}
						/>
					}
				/>
			)}
			{/* The place the alerts use right now, kept in place while switching to avoid a jump */}
			<View className="gap-1">
				<View className="flex-row items-center gap-2">
					<Ionicons name="location-outline" size={16} className="text-muted" />
					<Text className="flex-1 text-foreground">
						{place?.name ?? t("weather.settings.noPlace")}
					</Text>
				</View>
				<ForecastStatus switching={switching} />
			</View>
			{mode === "city" && <CitySearch />}
		</View>
	);
}
