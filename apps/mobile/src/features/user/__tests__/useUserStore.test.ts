const mockRows = new Map<number, string | null>();

jest.mock("@/utils/database", () => ({
	database: {
		getFirstSync: () => (mockRows.has(1) ? { name: mockRows.get(1) } : null),
		runAsync: async (_sql: string, name: string | null) => {
			mockRows.set(1, name);
		},
	},
}));

const { useUserStore } =
	require("@/features/user/useUserStore") as typeof import("@/features/user/useUserStore");

describe("useUserStore", () => {
	it("has no name by default", () => {
		expect(useUserStore.getState().name).toBeNull();
	});

	it("saves the name in the database", async () => {
		await useUserStore.getState().saveName("John");

		expect(useUserStore.getState().name).toBe("John");
		expect(mockRows.get(1)).toBe("John");
	});

	it("removes the name", async () => {
		await useUserStore.getState().saveName(null);

		expect(useUserStore.getState().name).toBeNull();
		expect(mockRows.get(1)).toBeNull();
	});
});
