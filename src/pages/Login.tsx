import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Complete todos los campos.');
      return;
    }
    if (login(username, password)) {
      navigate('/dashboard');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-slate-800">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Librería María</h1>
          <p className="text-slate-500 mt-1.5 text-lg">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-slate-700 mb-1.5">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-slate-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-base">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-8 p-5 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500 font-medium mb-2">Credenciales de prueba:</p>
          <div className="text-sm text-slate-400 space-y-1.5">
            <p><span className="font-mono">admin / admin123</span> — Administrador</p>
            <p><span className="font-mono">empleado / empleado123</span> — Empleado</p>
            <p><span className="font-mono">repositor / repo123</span> — Repositor</p>
            <p><span className="font-mono">cliente / cliente123</span> — Cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
