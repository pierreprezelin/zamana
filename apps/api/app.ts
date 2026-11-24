import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express, { type ErrorRequestHandler, type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { appRouter } from "./routes/index.ts";

const app: Express = express();

// No CORS: the only client is the native app, browsers on other sites stay out
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));

app.get("/", (_req, res) => {
	res.status(200).json({ message: "Welcome to the Express API!" });
});

app.use("/v1", createExpressMiddleware({ router: appRouter }));

app.use((_req, res) => {
	res.status(404).json({ code: "NOT_FOUND" });
});

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
	const status = typeof error?.status === "number" ? error.status : 500;
	if (status >= 500) console.error(error);
	res
		.status(status)
		.json({ code: status < 500 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR" });
};
app.use(handleError);

export default app;
