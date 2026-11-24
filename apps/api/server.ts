import "dotenv/config";
import app from "./app.ts";
import { readMinAppVersion } from "./controllers/version.ts";

if (!readMinAppVersion()) {
	throw new Error("MIN_APP_VERSION is missing or not a version like 1.2.3");
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
