import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { SnailPayModal } from '../components/SnailPayModal';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

/*
Test para el componente de snailpaymodal
simulando la creacion del componente asi como la aceptacion y rechazo del pago
*/


// Mock de la API global fetch
global.fetch = vi.fn();

// Mock del contexto useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock de storageService
vi.mock('../services/storageService', () => ({
  storageService: {
    saveCardData: vi.fn(),
    updateBalance: vi.fn().mockReturnValue(200),
  },
}));

describe('Componente SnailPayModal', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      session: {
        user: {
          id: 'usr-123',
          fullName: 'Juan Pérez',
          email: 'juan@ejemplo.com',
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('Renderiza los campos del modal con los valores iniciales', () => {
    render(<SnailPayModal onSuccess={mockOnSuccess} onClose={mockOnClose} />);

    expect(screen.getByRole('heading', { name: /carga de saldo con snailpay/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre titular:/i)).toHaveValue('Juan Pérez');
    expect(screen.getByLabelText(/número de tarjeta/i)).toHaveValue('');
    expect(screen.getByLabelText(/vencimiento/i)).toHaveValue('');
    expect(screen.getByLabelText(/cvv/i)).toHaveValue('');
    expect(screen.getByLabelText(/monto:/i)).toHaveValue(100);
  });

  test('Procesa exitosamente la recarga de saldo', async () => {
    const mockResponse = {
      status: 'approved',
      transaction_amount: 100,
      authorization_code: 'AUTH12345',
      card_number: '1234123412341234',
      cvv: '543',
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<SnailPayModal onSuccess={mockOnSuccess} onClose={mockOnClose} />);

    // Llenar campos requeridos
    await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '1234123412341234');
    await userEvent.type(screen.getByLabelText(/vencimiento/i), '12/26');
    await userEvent.type(screen.getByLabelText(/cvv/i), '543');

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /procesar pago/i }));

    await waitFor(() => {
      // Verifica llamada al backend local
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/snailpay/charge',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardNumber: '1234123412341234',
            expirationDate: '12/26',
            cvv: '543',
            fullName: 'Juan Pérez',
            amount: 100,
            payerId: 'usr-123',
            payerEmail: 'juan@ejemplo.com',
          }),
        })
      );

      // Verifica interacciones con localStorage y callback del padre
      expect(storageService.saveCardData).toHaveBeenCalledWith({
        number: '1234123412341234',
        cvv: '543',
      });
      expect(storageService.updateBalance).toHaveBeenCalledWith(100);
      expect(mockOnSuccess).toHaveBeenCalledWith(200);

      // Verifica mensaje de éxito en pantalla
      expect(
        screen.getByText(/¡recarga aprobada por \$100! código auth: auth12345/i)
      ).toBeInTheDocument();
    });
  });

  test('Muestra un error cuando la pasarela rechaza la transacción', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        status: 'rejected',
        status_detail: 'Fondos insuficientes',
        card_number: '1234123412341234',
        cvv: '543',
      }),
    });

    render(<SnailPayModal onSuccess={mockOnSuccess} onClose={mockOnClose} />);

    await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '1234123412341234');
    await userEvent.type(screen.getByLabelText(/vencimiento/i), '12/26');
    await userEvent.type(screen.getByLabelText(/cvv/i), '543');

    fireEvent.click(screen.getByRole('button', { name: /procesar pago/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/error en la transacción: fondos insuficientes/i)
      ).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  test('Muestra un mensaje de error si ocurre un fallo de red', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch')
    );

    render(<SnailPayModal onSuccess={mockOnSuccess} onClose={mockOnClose} />);

    await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '1234123412341234');
    await userEvent.type(screen.getByLabelText(/vencimiento/i), '12/26');
    await userEvent.type(screen.getByLabelText(/cvv/i), '543');

    fireEvent.click(screen.getByRole('button', { name: /procesar pago/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/error del sistema: no se pudo conectar con snailpay\./i)
      ).toBeInTheDocument();
    });
  });

  test('Llama a onClose al hacer clic en el botón Cerrar o fuera del modal', () => {
    render(<SnailPayModal onSuccess={mockOnSuccess} onClose={mockOnClose} />);

    // Clic en el botón Cerrar
    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});