import { Storage } from "expo-sqlite/kv-store";

const { useNotificationPreferencesStore } =
	require("@/features/notifications/useNotificationPreferencesStore") as typeof import("@/features/notifications/useNotificationPreferencesStore");

const state = () => useNotificationPreferencesStore.getState();
const restore = (saved: unknown) => {
	Storage.setItemSync(
		"notificationPreferences",
		JSON.stringify({ state: saved, version: 0 }),
	);
	useNotificationPreferencesStore.persist.rehydrate();
};
describe("useNotificationPreferencesStore", () => {
	beforeEach(() =>
		useNotificationPreferencesStore.setState(
			useNotificationPreferencesStore.getInitialState(),
		),
	);

	it("reminds at 9:00 by default", () => {
		expect(useNotificationPreferencesStore.getInitialState()).toMatchObject({
			remindersEnabled: true,
			reminderTime: "09:00",
			bannerDismissed: false,
		});
	});

	it("saves the reminder preferences", () => {
		state().setRemindersEnabled(false);
		state().setReminderTime("18:30");
		state().dismissBanner();

		expect(
			JSON.parse(Storage.getItemSync("notificationPreferences") ?? "{}").state,
		).toEqual({
			remindersEnabled: false,
			reminderTime: "18:30",
			bannerDismissed: true,
		});
	});

	it("restores the saved preferences on launch", () => {
		restore({
			remindersEnabled: false,
			reminderTime: "07:15",
			bannerDismissed: true,
		});
		expect(state()).toMatchObject({
			remindersEnabled: false,
			reminderTime: "07:15",
			bannerDismissed: true,
		});
	});

	it("falls back to the defaults from an unreadable save", () => {
		restore({
			remindersEnabled: "false",
			reminderTime: "25:00",
			bannerDismissed: 1,
		});
		expect(state()).toMatchObject({
			remindersEnabled: true,
			reminderTime: "09:00",
			bannerDismissed: false,
		});
	});
});
