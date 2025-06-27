import { Router } from "express";
import {
	createTask,
	getAllTasks,
	getUserTasks,
	applyForTask,
	getTaskApplications,
	assignTask,
	deleteTask,
	getUserBids,
	completeTask,
	getTaskDetails,
	approveTask,
	cancelTask,
	reopenTask,
	unassignTask,
} from "../controllers/tasks.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/", authenticate, createTask);
router.get("/", getAllTasks);
router.get("/user/:userId", authenticate, getUserTasks);
router.post("/:taskId/apply", authenticate, applyForTask);
router.get("/:taskId/applications", authenticate, getTaskApplications);
router.patch("/:taskId/assign", authenticate, assignTask);
router.delete("/:taskId", authenticate, deleteTask);
router.get("/bids/:userId", authenticate, getUserBids);
router.patch("/:taskId/complete", authenticate, completeTask);
router.get("/:taskId/details", authenticate, getTaskDetails);
router.patch("/:id/approve", authenticate, approveTask);
router.patch("/:id/cancel", authenticate, cancelTask);
router.patch("/:taskId/reopen", authenticate, reopenTask);
router.patch("/:taskId/unassign", authenticate, unassignTask);

export default router;
