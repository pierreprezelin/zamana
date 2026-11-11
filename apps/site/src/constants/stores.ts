export const GITHUB_URL = "https://github.com/pierreprezelin/zamana";

export type StoreId = "appStore" | "googlePlay";

// An empty url renders the store button in its "coming soon" state
export const STORE_URLS: Record<StoreId, string> = {
	appStore: "",
	googlePlay: "",
};
