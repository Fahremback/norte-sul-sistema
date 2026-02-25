import React, { useState, FormEvent } from 'react';
import { useServerConnection } from '../contexts/IpContext'; 
import ServerIcon from '../components/icons/ServerIcon'; 

const IpSetupPage: React.FC = () => {
  const [ipInput, setIpInput] = useState('');
  const [portInput, setPortInput] = useState('443');
  const [error, setError] = useState('');
  const { setServerConnection } = useServerConnection();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedIpInput = ipInput.trim().replace(/^https?:\/\//, '');
    const trimmedPort = portInput.trim();
    
    if (!cleanedIpInput || !trimmedPort) {
      setError('O endereço e a Porta não podem ser vazios.');
      return;
    }

    const portNumber = parseInt(trimmedPort, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
        setError('A porta deve ser um número válido entre 1 e 65535.');
        return;
    }
    
    const addressRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost|(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/;
    if (!addressRegex.test(cleanedIpInput)) {
        setError('Formato inválido. Use um IP (ex: 192.168.1.5) ou um hostname (ex: abc.ngrok-free.app).');
        return;
    }

    setError('');
    setServerConnection(cleanedIpInput, trimmedPort);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-black px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <ServerIcon className="h-16 w-16 text-green-600 mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Configurar Conexão
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Por favor, insira o IP ou Hostname e a Porta do servidor para conectar.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="ip-address" className="block text-sm font-medium text-gray-700">
              Endereço do Servidor (IP ou Hostname)
            </label>
            <input
              id="ip-address"
              name="ip-address"
              type="text"
              required
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="mt-1 appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="ex: abc.ngrok-free.app"
            />
          </div>
          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700">
              Porta do Servidor
            </label>
            <input
              id="port"
              name="port"
              type="number"
              required
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              className="mt-1 appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Ex: 443"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Conectar ao Servidor
            </button>
          </div>
        </form>
         <p className="mt-4 text-center text-xs text-gray-500">
          Esta informação fica salva apenas no seu dispositivo.
        </p>
      </div>
    </div>
  );
};

export default IpSetupPage;