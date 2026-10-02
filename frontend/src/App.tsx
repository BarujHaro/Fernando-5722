import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import './App.css'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

const DashboardDummy = () => {
  const {session, logout} = useAuth();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido, {session?.user.fullName}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardDummy />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;