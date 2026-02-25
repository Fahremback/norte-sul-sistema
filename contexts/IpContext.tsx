
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { ServerConnectionContextType } from '../types';

const CONNECTION_STORAGE_KEY = 'managementAppServerConnection';

const ServerConnectionContext = createContext<ServerConnectionContextType | undefined>(undefined);

export const ServerConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serverAddress, setAddress] = useState<{ ip: string; port: string } | null>(null);
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);

  useEffect(() => {
    try {
      const storedConnection = localStorage.getItem(CONNECTION_STORAGE_KEY);
      if (storedConnection) {
        setAddress(JSON.parse(storedConnection));
      }
    } catch (error) {
      console.error("Failed to read server connection from localStorage", error);
    } finally {
      setIsLoadingConnection(false);
    }
  }, []);

  const setServerConnection = useCallback((ip: string, port: string) => {
    try {
      const connection = { ip: ip.trim(), port: port.trim() };
      localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
      setAddress(connection);
    } catch (error) {
      console.error("Failed to save server connection to localStorage", error);
    }
  }, []);

  const clearServerConnection = useCallback(() => {
    try {
      localStorage.removeItem(CONNECTION_STORAGE_KEY);
      setAddress(null);
    } catch (error) {
      console.error("Failed to clear server connection from localStorage", error);
    }
  }, []);

  const isConnectionSet = !!serverAddress;

  return (
    <ServerConnectionContext.Provider value={{ serverAddress, isConnectionSet, setServerConnection, clearServerConnection, isLoadingConnection }}>
      {children}
    </ServerConnectionContext.Provider>
  );
};

export const useServerConnection = (): ServerConnectionContextType => {
  const context = useContext(ServerConnectionContext);
  if (context === undefined) {
    throw new Error('useServerConnection must be used within a ServerConnectionProvider');
  }
  return context;
};
