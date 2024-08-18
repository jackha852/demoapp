import express from "express";
import { placeOrder, takeOrder, getAllOrders } from "./service";

const router = express.Router();

router.post("/", placeOrder);
router.patch("/:id", takeOrder);
router.get("/", getAllOrders);

export default router;
