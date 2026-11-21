const mockStoredItems = new Map<string, string>();

jest.mock("expo-sqlite/kv-store", () => ({
	Storage: {
		getItemSync: (key: string) => mockStoredItems.get(key) ?? null,
		setItemSync: (key: string, value: string) =>
			mockStoredItems.set(key, value),
		removeItemSync: (key: string) => mockStoredItems.delete(key),
	},
}));

const { useNotificationPreferencesStore } =
	require("@/features/notifications/useNotificationPreferencesStore") as typeof import("@/features/notifications/useNotificationPreferencesStore");

const state = () => useNotificationPreferencesStore.getState();
const restore = (saved: unknown) => {
	mockStoredItems.set(
		"notificationPreferences",
		JSON.stringify({ state: saved, version: 0 }),
	);
	useNotificationPreferencesStore.persist.rehydrate();
};
const defaults = {
	remindersEnabled: true,
	reminderTime: "09:00" as const,
	bannerDismissed: false,
};

describe("useNotificationPreferencesStore", () => {
	beforeEach(() => useNotificationPreferencesStore.setState(defaults));

	it("reminds at 9:00 by default", () => {
		expect(state()).toMatchObject(defaults);
	});

	it("saves the reminder preferences", () => {
		state().setRemindersEnabled(false);
		state().setReminderTime("18:30");
		state().dismissBanner();

		expect(
			JSON.parse(mockStoredItems.get("notificationPreferences") ?? "{}").state,
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
		expect(state()).toMatchObject(defaults);
	});
});
