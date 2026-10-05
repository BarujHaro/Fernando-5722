import React, {useState} from 'react';
import {useAuth} from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../style/Auth.css';


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
    <div className='pageContent'>
      <h2>BIENVENIDO A SNAILBET</h2>

       <div className="mainContent card">
      <h3>Crear Cuenta</h3>
      {error && <p className="errorMessage">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label htmlFor="nombre">Nombre completo:</label>
          <input
            id="nombre"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            
          />
        </div>
        <div className="formGroup">
          <label htmlFor="email">Correo electrónico:</label>
          <input
            id="email"
            type="email"
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
        <div className="formGroup">
          <label htmlFor="confirmPassword">Confirmar contraseña:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="boton-principal">
          Registrarse
        </button>
      </form>
      <hr></hr>
      <p className="registerText">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>   
    </div>     
    );
};