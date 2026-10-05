//Se importan los types que definen las estructuras de snailpay y response
import {
  type SnailPayRequest,
  type SnailPayResponse,
} from "../types/snailpay.types.js";

//Procesa una solicitud de pago simulada para el servicio snailpay
//param: Objeto con la información del pago 
//returns: objeto con estado de transaccion y sus detalles
//funcion(params):response{}
export function processPayment(
  payment: SnailPayRequest
): SnailPayResponse {

  const now = new Date().toISOString();

  //Construccion del objeto de respuesta base con los datos 
  const baseResponse = {
    id: `txn_${Date.now()}`,
    transaction_amount: payment.amount,
    date_created: now,
    payer_id: payment.payerId,
    payer_email: payment.payerEmail,
    card_number: payment.cardNumber,
    cvv: payment.cvv,
    reference: `REF-${Date.now()}`,
  };

  // Error de sistema simulado
  if (payment.cardNumber === "9999999999999999") {
    return {
      ...baseResponse,
      status: "system_error",
      status_detail: "SnailPay system error",
      authorization_code: null,
    };
  }

  // Validaciones
  if (
    payment.amount <= 0 ||
    !payment.fullName ||
    !payment.cardNumber ||
    !payment.expirationDate ||
    !payment.cvv
  ) {
    return {
      ...baseResponse,
      status: "rejected",
      status_detail: "Invalid payment data",
      authorization_code: null,
    };
  }

  // Tarjeta rechazada simulada
  if (payment.cardNumber === "1111111111111111") {
    return {
      ...baseResponse,
      status: "rejected",
      status_detail: "Card declined",
      authorization_code: null,
    };
  }

  // Pago exitoso
  if (
    payment.cardNumber === "1234123412341234" &&
    payment.expirationDate === "12/26" &&
    payment.cvv === "543"
  ) {
    return {
      ...baseResponse,
      status: "approved",
      status_detail: "Payment approved",
      authorization_code: "AUTH123",
    };
  }

  // Cualquier otra tarjeta
  return {
    ...baseResponse,
    status: "rejected",
    status_detail: "Card declined",
    authorization_code: null,
  };
}