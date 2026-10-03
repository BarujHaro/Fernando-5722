import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

interface Props {
  onSuccess: (newAmount: number) => void;
  onClose: () => void;
}

export const SnailPayModal: React.FC<Props> = ({ onSuccess, onClose }) => {
  const { session } = useAuth();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [fullName, setFullName] = useState(session?.user.fullName || '');
  const [amount, setAmount] = useState<number>(100);
  const [simulateSystemError, setSimulateSystemError] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (simulateSystemError) {
        headers['x-simulate-system-error'] = 'true';
      }

      const response = await fetch('http://localhost:3000/api/snailpay/charge', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cardNumber,
          expirationDate, 
          cvv,
          fullName,
          amount,
          payerId: session?.user.id,
          payerEmail: session?.user.email,
        }),
      });

      const data = await response.json();

      // Guardar tarjeta y CVV ficticios en LocalStorage (Requerimiento 2.4)
      storageService.saveCardData({ number: data.card_number, cvv: data.cvv });

      if (response.ok && data.status === 'approved') {
        const newBalance = storageService.updateBalance(data.transaction_amount);
        setMessage({ type: 'success', text: `¡Recarga aprobada por $${data.transaction_amount}! Código Auth: ${data.authorization_code}` });
        onSuccess(newBalance);
      } else {
        setMessage({ type: 'error', text: `Error en la transacción: ${data.status_detail}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error del sistema: No se pudo conectar con SnailPay.' });
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#fff' }}>
      <h3>Carga de saldo con SnailPay</h3>
      {message && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleCharge}>
        <div>
          <label>Nombre Titular:</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label>Número de Tarjeta (Exitoso: 1234123412341234):</label>
          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
        </div>
        <div>
          <label>Fecha Vencimiento (Exitoso: 12/26):</label>
          <input type="text" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />
        </div>
        <div>
          <label>CVV (Exitoso: 543):</label>
          <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
        </div>
        <div>
          <label>Monto:</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={simulateSystemError} 
              onChange={(e) => setSimulateSystemError(e.target.checked)} 
            />
            Simular Error de Sistema SnailPay
          </label>
        </div>

        <div style={{ marginTop: '15px' }}>
          <button type="submit">Procesar Pago</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cerrar</button>
        </div>
      </form>
    </div>
  );
};