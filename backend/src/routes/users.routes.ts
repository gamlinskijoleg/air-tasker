import { Router } from "express";
import { setWorkerRole, setCustomerRole, getUsername } from "../controllers/users.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/set-role/worker", authenticate, setWorkerRole);
router.post("/set-role/customer", authenticate, setCustomerRole);
router.get("/username", getUsername);

export default router;
