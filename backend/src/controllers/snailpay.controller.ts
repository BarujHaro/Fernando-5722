import { type Request, type Response } from "express";
import { processPayment } from "../services/snailpay.service.js";
import { type SnailPayRequest } from "../types/snailpay.types.js";

/**
 * Controlador de Express para procesar la creación de un nuevo pago con SnailPay.
 * 
 * @param req Objeto de solicitud HTTP de Express
 * @param res Objeto de respuesta HTTP de Express
 */
export function createPayment(
  req: Request,
  res: Response
) {
  try{
    // Convierte/asigna el cuerpo de la petición (JSON) al tipo SnailPayRequest
  const payment = req.body as SnailPayRequest;

  const response = processPayment(payment);

// Si la pasarela devuelve un error interno del sistema (simulado o no)
  if (response.status === "system_error") {
    console.log(response);
    return res.status(500).json(response);
  }

  // Si el pago fue rechazado (datos inválidos, tarjeta declinada, etc.)
  if (response.status === "rejected") {
    console.log(response);
    return res.status(400).json(response);
  }

  // Si el pago fue aprobado exitosamente
  console.log(response);
  return res.status(200).json(response);
  }catch(error){
    console.error("Error inesperado en el controlador de pagos:", error);
    return res.status(500).json({
      status: "system_error",
      status_detail: "Error interno del servidor al procesar el pago",
      authorization_code: null,
    });
  }
}