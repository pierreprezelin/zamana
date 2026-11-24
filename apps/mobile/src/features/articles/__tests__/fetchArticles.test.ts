import { fetchArticles } from "@/features/articles/fetchArticles";
import { getJson } from "@/utils/getJson";

jest.mock("@/utils/getJson", () => ({ getJson: jest.fn() }));

const article = {
	slug: "thirsty-plant",
	title: "Comment savoir si ma plante a soif ?",
	category: "watering",
	body: "Enfoncez un doigt dans le terreau.",
};

describe("fetchArticles", () => {
	it("fetches the articles of the language", async () => {
		jest.mocked(getJson).mockResolvedValue([article]);

		await expect(fetchArticles("fr")).resolves.toEqual([article]);
		expect(getJson).toHaveBeenCalledWith(
			expect.stringMatching(/\/articles\/fr\.json$/),
		);
	});

	it("keeps the valid articles of a partly invalid answer", async () => {
		jest
			.mocked(getJson)
			.mockResolvedValue([article, { ...article, category: "recipes" }]);

		await expect(fetchArticles("en")).resolves.toEqual([article]);
	});

	it("rejects an answer that is not a list of articles", async () => {
		jest.mocked(getJson).mockResolvedValue({ error: "maintenance" });

		await expect(fetchArticles("fr")).rejects.toThrow();
	});

	it("rejects when the site cannot be reached", async () => {
		jest.mocked(getJson).mockRejectedValue(new Error("offline"));

		await expect(fetchArticles("fr")).rejects.toThrow("offline");
	});
});
