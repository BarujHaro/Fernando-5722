import React, {useState} from 'react';
import {useAuth} from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
    const {register} = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !confirmPassword) {
        setError('Todos los campos son obligatorios.');
        return;
        }

        if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
        }

        if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
        }

        const success = register(fullName, email, password);
        if (!success) {
        setError('El correo electrónico ya está registrado.');
        return;
        }

        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        navigate('/login');
    };


    return (
<div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2>Crear Cuenta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre completo:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Correo electrónico:</label>
          <input
            type="email"
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
        <div>
          <label>Confirmar contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Registrarse
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>        
    );
};