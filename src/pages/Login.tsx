import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Info } from 'lucide-react';

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
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 relative">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Librería María</h1>
          <p className="text-slate-500 mt-1.5 text-lg">Acceso al Sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-slate-700 mb-1.5">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base transition-shadow"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-slate-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base transition-shadow"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-base border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Info size={80} className="text-blue-600" />
          </div>
          <p className="text-base text-blue-800 font-semibold mb-3 flex items-center gap-2">
            <Info size={18} /> Credenciales de Prueba (Maqueta)
          </p>
          <div className="text-sm text-blue-900/80 space-y-2 relative z-10">
            <p className="flex justify-between border-b border-blue-200/50 pb-1">
              <span>Administrador:</span>
              <span className="font-mono bg-blue-100/50 px-2 rounded">admin / admin123</span>
            </p>
            <p className="flex justify-between border-b border-blue-200/50 pb-1">
              <span>Empleado:</span>
              <span className="font-mono bg-blue-100/50 px-2 rounded">empleado / empleado123</span>
            </p>
            <p className="flex justify-between border-b border-blue-200/50 pb-1">
              <span>Repositor:</span>
              <span className="font-mono bg-blue-100/50 px-2 rounded">repositor / repo123</span>
            </p>
            <p className="flex justify-between">
              <span>Cliente (Web):</span>
              <span className="font-mono bg-blue-100/50 px-2 rounded">cliente / cliente123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
