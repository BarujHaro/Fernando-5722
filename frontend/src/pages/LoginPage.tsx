import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../style/Auth.css';

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
    <div className='pageContent'>
      <h2>BIENVENIDO A SNAILBET</h2>

       <div className="mainContent card">
      <h3>Iniciar sesión</h3>
      {error && <p className="errorMessage">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            id="email"
            type="email"
            placeholder="tu.correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
   
          />
        </div>
        <div className="formGroup">
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}

          />
        </div>
        <button type="submit" className="boton-principal">
          Iniciar Sesión
        </button>
      </form>
      <hr></hr>
      <p className="registerText">
        o <Link to="/register">Regístrate</Link>
      </p>
      </div>
    </div>
  );
};

