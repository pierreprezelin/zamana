import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { appRouter } from "./routes/index.ts";

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (_req, res) => {
	res.status(200).json({ message: "Welcome to the Express API!" });
});

app.use("/v1", createExpressMiddleware({ router: appRouter }));

app.use((_req, res) => {
	res.status(404).json({ error: "Route not found" });
});

export default app;
