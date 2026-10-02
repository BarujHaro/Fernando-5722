import { Router } from "express";
import { createPayment } from "../controllers/snailpay.controller.js";

const router = Router();

router.post("/charge", createPayment);

export default router;