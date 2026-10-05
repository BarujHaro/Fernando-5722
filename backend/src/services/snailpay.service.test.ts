import { describe, it, expect } from 'vitest';
import { processPayment } from './snailpay.service.js';

//Este test simula los pagos (Exitoso, Rechazado y error de sistema)

describe('SnailPay', () => {

  it('debe aprobar un pago exitoso', () => {
    const payment = {
      cardNumber: '1234123412341234',
      expirationDate: '12/26',
      cvv: '543',
      fullName: 'Fernando Haro',
      amount: 500,
      payerId: 'user-001',
      payerEmail: 'fernando@example.com',
    };

    const response = processPayment(payment);

    expect(response.status).toBe('approved');
    expect(response.status_detail).toBe('Payment approved');
    expect(response.transaction_amount).toBe(500);
    expect(response.payer_id).toBe('user-001');
    expect(response.payer_email).toBe('fernando@example.com');
    expect(response.authorization_code).not.toBeNull();
  });


  it('debe rechazar una tarjeta no autorizada', () => {
    const payment = {
      cardNumber: '1111111111111111',
      expirationDate: '12/26',
      cvv: '543',
      fullName: 'Fernando Haro',
      amount: 500,
      payerId: 'user-001',
      payerEmail: 'fernando@example.com',
    };

    const response = processPayment(payment);

    expect(response.status).toBe('rejected');
    expect(response.status_detail).toBe('Card declined');
    expect(response.authorization_code).toBeNull();
  });


  it('debe devolver un error de sistema', () => {
    const payment = {
      cardNumber: '9999999999999999',
      expirationDate: '12/26',
      cvv: '543',
      fullName: 'Fernando Haro',
      amount: 500,
      payerId: 'user-001',
      payerEmail: 'fernando@example.com',
    };

    const response = processPayment(payment);

    expect(response.status).toBe('system_error');
    expect(response.status_detail).toBe('SnailPay system error');
    expect(response.authorization_code).toBeNull();
  });

});