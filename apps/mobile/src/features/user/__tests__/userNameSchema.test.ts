import { userNameSchema } from "@/features/user/userNameSchema";

const errorOf = (name: string) =>
	userNameSchema.safeParse(name).error?.issues[0]?.message;

describe("userNameSchema", () => {
	it.each(["John", "Zoé", "Marie-Christine", "N'Golo", "D’Artagnan"])(
		"accepts %s",
		(name) => {
			expect(userNameSchema.safeParse(name).success).toBe(true);
		},
	);

	it("trims surrounding spaces", () => {
		expect(userNameSchema.parse("  John ")).toBe("John");
	});

	it("removes the name when left empty", () => {
		expect(userNameSchema.parse("   ")).toBeNull();
	});

	it.each(["John2", "Jean Pierre", "John!"])("rejects %s", (name) => {
		expect(errorOf(name)).toBe(
			"Le nom doit comporter uniquement des lettres, un tiret ou une apostrophe.",
		);
	});

	it("rejects names over 20 characters", () => {
		expect(errorOf("a".repeat(21))).toBe(
			"Le nom ne peut pas dépasser 20 caractères.",
		);
	});
});
