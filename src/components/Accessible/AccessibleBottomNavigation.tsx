import React, { useRef, useEffect } from 'react';
import { CalendarIcon, ClockIcon, PlusCircleIcon, UsersIcon, SettingsIcon, HomeIcon, MenuIcon } from 'lucide-react';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';

interface AccessibleBottomNavigationProps {
  currentScreen: string;
  navigateTo: (screen: string) => void;
}

export const AccessibleBottomNavigation: React.FC<AccessibleBottomNavigationProps> = ({
  currentScreen,
  navigateTo
}) => {
  const navigationRef = useRef<HTMLElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'View your care dashboard and today\'s tasks'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <CalendarIcon className="w-5 h-5" />,
      description: 'View and manage care schedules'
    },
    {
      id: 'action',
      label: 'Action',
      icon: <PlusCircleIcon className="w-5 h-5" />,
      description: 'Create tasks, send alerts, and take quick actions'
    },
    {
      id: 'care-network',
      label: 'Network',
      icon: <UsersIcon className="w-5 h-5" />,
      description: 'Connect with your care team and community'
    },
    {
      id: 'more',
      label: 'More',
      icon: <MenuIcon className="w-5 h-5" />,
      description: 'Settings, help, and additional options'
    }
  ];

  // Focus management for keyboard navigation
  useEffect(() => {
    if (activeButtonRef.current && document.activeElement === document.body) {
      // Only auto-focus if no other element has focus
      activeButtonRef.current.focus();
    }
  }, [currentScreen]);

  const handleNavigate = (screen: string) => {
    if (currentScreen !== screen) {
      navigateTo(screen);
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'accessible_bottom_navigation',
        destination: screen
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, screen: string) => {
    // Handle Enter and Space for activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate(screen);
    }
    
    // Handle arrow key navigation
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const currentIndex = navigationItems.findIndex(item => item.id === currentScreen);
      let nextIndex;
      
      if (event.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : navigationItems.length - 1;
      } else {
        nextIndex = currentIndex < navigationItems.length - 1 ? currentIndex + 1 : 0;
      }
      
      const nextScreen = navigationItems[nextIndex].id;
      handleNavigate(nextScreen);
    }
  };

  return (
    <nav
      ref={navigationRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto"
      role="tablist"
      aria-label="Main navigation"
    >
      {/* Screen reader announcement for current page */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Current page: {navigationItems.find(item => item.id === currentScreen)?.label}
      </div>
      
      <div className="flex justify-around items-center py-2 px-4">
        {navigationItems.map((item) => {
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => handleNavigate(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className={`
                flex flex-col items-center justify-center 
                min-w-[44px] min-h-[44px] p-2 rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${item.id}-panel`}
              aria-describedby={`${item.id}-description`}
              tabIndex={isActive ? 0 : -1}
            >
              {/* Icon with proper sizing */}
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                {item.icon}
              </div>
              
              {/* Label with proper typography */}
              <span className="text-xs font-medium leading-tight">
                {item.label}
              </span>
              
              {/* Hidden description for screen readers */}
              <span id={`${item.id}-description`} className="sr-only">
                {item.description}
              </span>
              
              {/* Visual active indicator */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 
                   bg-blue-600 text-white px-4 py-2 rounded-br-lg z-50
                   focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
    </nav>
  );
};