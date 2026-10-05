import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { RegisterPage } from '../pages/RegisterPage';

global.fetch = vi.fn();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Componente Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  test('Renderiza los campos del formulario correctamente', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  test('Muestra mensaje de éxito cuando el registro es correcto', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '¡Registro exitoso! Ya puedes iniciar sesión.' }),
    });

    renderWithProviders(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez');
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
    await userEvent.type(screen.getByLabelText(/^contraseña:$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123');

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringMatching(/¡Registro exitoso! Ya puedes iniciar sesión./i)
      );
    });
  });
});