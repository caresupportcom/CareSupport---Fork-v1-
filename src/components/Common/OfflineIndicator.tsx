import React, { useEffect, useState } from 'react';
import { WifiOffIcon } from 'lucide-react';
import { offlineService } from '../../services/OfflineService';
export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!offlineService.isNetworkOnline());
  const [showBanner, setShowBanner] = useState(false);
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = offlineService.subscribeToConnectionChanges(online => {
      setIsOffline(!online);
      // Show banner when connection status changes
      if (!online) {
        setShowBanner(true);
        // Hide banner after 5 seconds
        setTimeout(() => setShowBanner(false), 5000);
      } else {
        setShowBanner(true);
        // Hide banner after 3 seconds if we're back online
        setTimeout(() => setShowBanner(false), 3000);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  if (!showBanner) return null;
  return <div className={`fixed top-0 left-0 right-0 p-3 flex items-center justify-center z-50 transition-all duration-300 ${isOffline ? 'bg-orange-500' : 'bg-green-500'}`} role="alert" aria-live="assertive">
      <div className="flex items-center text-white">
        {isOffline ? <>
            <WifiOffIcon className="w-5 h-5 mr-2" />
            <span>You're offline. Some features may be limited.</span>
          </> : <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>You're back online!</span>
          </>}
      </div>
    </div>;
};