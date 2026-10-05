import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { SnailPayModal } from '../components/SnailPayModal';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../style/Dahsboard.css';



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
    <div className="dashboard-container">
      <header className="user-balance">
        <h2>Dashboard - SnailBet</h2>
        <button onClick={logout} className='btn-secundario'>Cerrar Sesión</button>
      </header>

      <hr />

      <section className="second-section">
        <h3>Usuario: {session?.user.fullName}</h3>
        <p>
          Saldo Actual: <strong>${balance.toFixed(2)}</strong>
        </p>
        <button onClick={() => setShowModal(true)} className='boton-principal'>Recargar Saldo</button>
      </section>

      <hr />

      {showModal && (
        <SnailPayModal 
          onSuccess={(newBalance) => setBalance(newBalance)} 
          onClose={() => setShowModal(false)} 
        />
      )}

      <div className="charts-section">
        {/* Gráfica 1: Donut de Apuestas */}
        <div className="chart-card chart-card-donut">
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
        <div className="chart-card chart-card-bar">
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