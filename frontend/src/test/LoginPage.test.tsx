import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';

/*
Test para login donde se crea el componente
Se simulan errores y la redirección al dashboard
*/


// Mock del hook useNavigate de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock del hook useAuth si quieres controlar directamente la función login
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('Componente LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuración por defecto para el hook useAuth
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('Renderiza los elementos y campos del formulario correctamente', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /bienvenido a snailbet/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument();
  });

  test('Muestra un mensaje de error si se intenta enviar el formulario con campos vacíos', async () => {
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/por favor llena todos los campos\./i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('Muestra un mensaje de error cuando las credenciales son inválidas', async () => {
    mockLogin.mockReturnValueOnce(false);

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/correo electrónico:/i), 'usuario@ejemplo.com');
    await userEvent.type(screen.getByLabelText(/contraseña:/i), 'wrongpassword');

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockLogin).toHaveBeenCalledWith('usuario@ejemplo.com', 'wrongpassword');
    expect(screen.getByText(/credenciales inválidas\./i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('Redirige a /dashboard cuando el inicio de sesión es exitoso', async () => {
    mockLogin.mockReturnValueOnce(true);

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/correo electrónico:/i), 'usuario@ejemplo.com');
    await userEvent.type(screen.getByLabelText(/contraseña:/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockLogin).toHaveBeenCalledWith('usuario@ejemplo.com', 'password123');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});