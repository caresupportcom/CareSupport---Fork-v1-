import React from 'react';
import { WifiOffIcon } from 'lucide-react';
import { useConnection } from '../../contexts/ConnectionContext';
export const OfflineBanner = () => {
  const {
    isOnline
  } = useConnection();
  if (isOnline) {
    return null;
  }
  return <div className="bg-orange-500 text-white py-2 px-4 flex items-center justify-center text-sm" role="alert" aria-live="assertive">
      <WifiOffIcon className="w-4 h-4 mr-2" />
      <span>You're currently offline. Some features may be limited.</span>
    </div>;
};