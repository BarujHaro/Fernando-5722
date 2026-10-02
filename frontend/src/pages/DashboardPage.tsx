import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { SnailPayModal } from '../components/SnailPayModel';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Datos simulados de apuestas (Donut)
const betsData = [
  { name: 'Ganadas', value: 12, color: '#4CAF50' },
  { name: 'Perdidas', value: 5, color: '#F44336' },
];

// Datos simulados de victorias de 6 caracoles en 6 carreras (Barras)
const snailsData = [
  { name: 'Veloz', victorias: 2 },
  { name: 'Turbo', victorias: 1 },
  { name: 'Flash', victorias: 1 },
  { name: 'Rayo', victorias: 1 },
  { name: 'Lento', victorias: 1 },
  { name: 'SnailX', victorias: 0 },
];

export const DashboardPage: React.FC = () => {
  const { session, logout } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setBalance(storageService.getBalance());
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard - SnailBet</h2>
        <button onClick={logout}>Cerrar Sesión</button>
      </header>

      <hr />

      <section style={{ margin: '20px 0' }}>
        <h3>Usuario: {session?.user.fullName}</h3>
        <p style={{ fontSize: '1.2rem' }}>
          Saldo Actual: <strong>${balance.toFixed(2)}</strong>
        </p>
        <button onClick={() => setShowModal(true)}>Recargar Saldo con SnailPay</button>
      </section>

      {showModal && (
        <SnailPayModal 
          onSuccess={(newBalance) => setBalance(newBalance)} 
          onClose={() => setShowModal(false)} 
        />
      )}

      <div style={{ display: 'flex', gap: '40px', marginTop: '30px', flexWrap: 'wrap' }}>
        {/* Gráfica 1: Donut de Apuestas */}
        <div style={{ width: '300px', height: '300px' }}>
          <h4>Apuestas Ganadas vs Perdidas</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={betsData} dataKey="value" innerRadius={60} outerRadius={80} fill="#8884d8" label>
                {betsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica 2: Barras de Caracoles */}
        <div style={{ width: '400px', height: '300px' }}>
          <h4>Victorias de Caracoles (6 Carreras)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snailsData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="victorias" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};