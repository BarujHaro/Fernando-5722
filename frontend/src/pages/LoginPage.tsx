import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor llena todos los campos.');
      return;
    }

    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2>BIENVENIDO A SNAILBET</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            placeholder="tu.correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Iniciar Sesión
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        o <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

