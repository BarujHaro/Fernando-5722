import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

import '../style/SnailPayModal.css';

// Define las propiedades (props) que el componente padre debe pasarle a este modal
interface Props {
  onSuccess: (newAmount: number) => void; // Función callback que se ejecuta tras un pago exitoso, recibe el nuevo saldo
  onClose: () => void;  // Función para cerrar el modal
}
// Define el componente funcional de React usando TypeScript (React.FC)
export const SnailPayModal: React.FC<Props> = ({ onSuccess, onClose }) => {
  const { session } = useAuth();  // Obtiene los datos de la sesión del usuario actual
  
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [fullName, setFullName] = useState(session?.user.fullName || '');
  const [amount, setAmount] = useState<number>(100);
  const [simulateSystemError, setSimulateSystemError] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
// Función principal que procesa el formulario 
  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue por el comportamiento nativo del formulario
    setMessage(null);// Limpia cualquier mensaje previo en pantalla

    try {
        // Configura las cabeceras HTTP iniciales indicando que se enviará un JSON
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (simulateSystemError) {
        headers['x-simulate-system-error'] = 'true';
      }
    // Realiza la petición POST a la API local que simula la pasarela de pagos SnailPay
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

      // Guardar tarjeta y CVV ficticios en LocalStorage 
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
<div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h3>Carga de saldo con SnailPay</h3>

        {message && (
          <p className={`message ${message.type}`}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleCharge}> 
          <div className="form-group">
            <label htmlFor="nombre">Nombre Titular:</label>
            <input 
              id="nombre"
              type="text" 
              className="form-control"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero">Número de Tarjeta (Exitoso: 1234123412341234):</label>
            <input 
              id="numero"
              type="text" 
              className="form-control"
              value={cardNumber} 
              onChange={(e) => setCardNumber(e.target.value)} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vencimiento">Vencimiento (12/26):</label>
              <input 
                id="vencimiento"
                type="text" 
                className="form-control"
                value={expirationDate} 
                onChange={(e) => setExpirationDate(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV (543):</label>
              <input 
                id="cvv"
                type="text" 
                className="form-control"
                value={cvv} 
                onChange={(e) => setCvv(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="monto">Monto:</label>
            <input 
              id="monto"
              type="number" 
              min="1" 
              className="form-control"
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))} 
              required 
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input 
                type="checkbox" 
                checked={simulateSystemError} 
                onChange={(e) => setSimulateSystemError(e.target.checked)} 
              />
              {' '}Simular Error de Sistema SnailPay
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secundario" onClick={onClose}>
              Cerrar
            </button>
            <button type="submit" className="btn boton-principal">
              Procesar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};