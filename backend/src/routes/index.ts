import { Router } from "express";
import authRoutes from "./auth.routes";
import taskRoutes from "./tasks.routes";
import userRoutes from "./users.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);

export default router;
