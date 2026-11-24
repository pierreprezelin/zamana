const { useOnboardingStore } =
	require("@/features/onboarding/useOnboardingStore") as typeof import("@/features/onboarding/useOnboardingStore");

describe("useOnboardingStore", () => {
	it("is not completed on first launch", () => {
		expect(useOnboardingStore.getState().completed).toBe(false);
	});

	it("stays completed on the next launches", () => {
		useOnboardingStore.getState().complete();

		jest.isolateModules(() => {
			const relaunched =
				require("@/features/onboarding/useOnboardingStore") as typeof import("@/features/onboarding/useOnboardingStore");
			expect(relaunched.useOnboardingStore.getState().completed).toBe(true);
		});
	});
});
