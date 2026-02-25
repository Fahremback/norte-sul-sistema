import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { LoginResult } from '../types';

// Icons for password visibility
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.572M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" /></svg>;


const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or CPF
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);
  
  if (currentUser) {
    return <LoadingSpinner text="Redirecionando..." />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result: LoginResult = await login(identifier, password);
    setIsLoading(false);
    
    if (result === 'success') {
      navigate(from, { replace: true });
    } else if (result === 'user_not_found') {
      setError('E-mail/CPF não encontrado no sistema.');
    } else if (result === 'invalid_password') {
      setError('Senha incorreta. Tente novamente.');
    } else {
      setError('Ocorreu um erro desconhecido. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-600 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-green-700">
            Norte Sul Informática
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse sua conta para gerenciar o sistema.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 sr-only">
              E-mail ou CPF
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username" 
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="E-mail ou CPF"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm pr-10"
              placeholder="Senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" colorClass="border-white" />
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">
          Problemas para acessar? Contate o administrador.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;