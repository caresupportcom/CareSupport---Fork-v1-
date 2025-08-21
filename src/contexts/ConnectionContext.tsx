import React, { useEffect, useState, createContext, useContext } from 'react';
import { connection } from '../services/ConnectionService';
interface ConnectionContextType {
  isOnline: boolean;
}
const ConnectionContext = createContext<ConnectionContextType>({
  isOnline: true
});
export const useConnection = () => useContext(ConnectionContext);
export const ConnectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [isOnline, setIsOnline] = useState(connection.isOnline());
  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = connection.subscribe(online => {
      setIsOnline(online);
    });
    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);
  return <ConnectionContext.Provider value={{
    isOnline
  }}>
      {children}
    </ConnectionContext.Provider>;
};