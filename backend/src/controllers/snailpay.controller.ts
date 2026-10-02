import { type Request, type Response } from "express";
import { processPayment } from "../services/snailpay.service.js";
import { type SnailPayRequest } from "../types/snailpay.types.js";


export function createPayment(
  req: Request,
  res: Response
) {
  const payment = req.body as SnailPayRequest;

  const response = processPayment(payment);

  if (response.status === "system_error") {
    return res.status(500).json(response);
  }

  if (response.status === "rejected") {
    return res.status(400).json(response);
  }

  return res.status(200).json(response);
}