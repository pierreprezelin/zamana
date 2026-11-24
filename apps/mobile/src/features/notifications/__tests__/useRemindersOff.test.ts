import { act, renderHook } from "@testing-library/react-native";
import { useNotificationPermissionStore } from "@/features/notifications/useNotificationPermissionStore";
import { useNotificationPreferencesStore } from "@/features/notifications/useNotificationPreferencesStore";
import { useRemindersOff } from "@/features/notifications/useRemindersOff";

jest.mock("@/features/notifications/notificationChannel", () => ({
	ensureChannel: () => Promise.resolve(),
}));

const request = jest.fn(() => Promise.resolve());

const setup = (
	permission: { granted: boolean | null; canAskAgain: boolean },
	remindersEnabled = false,
) => {
	useNotificationPreferencesStore.setState({ remindersEnabled });
	useNotificationPermissionStore.setState({ ...permission, request });
	return renderHook(() => useRemindersOff());
};

beforeEach(() => request.mockClear());

describe("useRemindersOff", () => {
	it("turns the reminders back on", async () => {
		const { result } = await setup({ granted: true, canAskAgain: true });

		await act(() => result.current.enable());

		expect(useNotificationPreferencesStore.getState().remindersEnabled).toBe(
			true,
		);
	});

	it.each([
		["not read yet", null],
		["refused", false],
	])("asks for the permission when it is %s", async (_, granted) => {
		const { result } = await setup({ granted, canAskAgain: true });

		await act(() => result.current.enable());

		expect(request).toHaveBeenCalledTimes(1);
	});

	it("does not ask again for a permission already granted", async () => {
		const { result } = await setup({ granted: true, canAskAgain: true });

		await act(() => result.current.enable());

		expect(request).not.toHaveBeenCalled();
	});

	it("offers to enable the reminders while the system still asks", async () => {
		const { result } = await setup({ granted: false, canAskAgain: true });

		expect(result.current.enableTitle).toBe("Activer les rappels");
	});

	it("offers to open the settings once the system no longer asks", async () => {
		const { result } = await setup({ granted: false, canAskAgain: false });

		expect(result.current.enableTitle).toBe("Ouvrir les réglages");
	});

	it("keeps the enable label while the permission is not read yet", async () => {
		const { result } = await setup({ granted: null, canAskAgain: false });

		expect(result.current.enableTitle).toBe("Activer les rappels");
	});

	it.each([
		[false, true, "disabledInSettings"],
		[true, false, "notAllowed"],
		[true, true, null],
	])(
		"explains why the reminders are off (enabled %s, granted %s)",
		async (enabled, granted, reason) => {
			const { result } = await setup({ granted, canAskAgain: true }, enabled);

			expect(result.current.reason).toBe(reason);
		},
	);
});
