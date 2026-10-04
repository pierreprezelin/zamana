import { Router } from "express";
import { getVersion } from "../controllers/version.ts";

const router: Router = Router();

router.get("/", getVersion);

export default router;
