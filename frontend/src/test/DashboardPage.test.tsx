import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';

// Mock de recharts para evitar problemas con ResponsiveContainer en jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '800px', height: '600px' }}>{children}</div>
    ),
  };
});

// Mock del contexto de autenticación
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock del servicio de almacenamiento
vi.mock('../services/storageService', () => ({
  storageService: {
    getBalance: vi.fn().mockReturnValue(100),
    logout: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('DashboardPage - Cierre de sesión', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { fullName: 'Juan Pérez' } },
      logout: mockLogout,
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('Llama a la función logout cuando el usuario hace clic en "Cerrar Sesión"', () => {
    renderWithProviders(<DashboardPage />);

    // Buscar y hacer clic en el botón de cerrar sesión
    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(logoutButton);

    // Verificar que la función logout del contexto se haya ejecutado
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});