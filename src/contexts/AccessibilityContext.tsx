import React, { useEffect, useState, createContext, useContext } from 'react';
interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReduceMotion: () => void;
}
const defaultAccessibilityContext: AccessibilityContextType = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  toggleHighContrast: () => {},
  toggleLargeText: () => {},
  toggleReduceMotion: () => {}
};
export const AccessibilityContext = createContext<AccessibilityContextType>(defaultAccessibilityContext);
export const useAccessibility = () => useContext(AccessibilityContext);
export const AccessibilityProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility_high_contrast');
    const savedLargeText = localStorage.getItem('accessibility_large_text');
    const savedReduceMotion = localStorage.getItem('accessibility_reduce_motion');
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedLargeText) setLargeText(savedLargeText === 'true');
    if (savedReduceMotion) setReduceMotion(savedReduceMotion === 'true');
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !savedReduceMotion) {
      setReduceMotion(true);
    }
  }, []);
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('accessibility_high_contrast', highContrast.toString());
    localStorage.setItem('accessibility_large_text', largeText.toString());
    localStorage.setItem('accessibility_reduce_motion', reduceMotion.toString());
    // Apply settings to document
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.classList.toggle('large-text', largeText);
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [highContrast, largeText, reduceMotion]);
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);
  const toggleReduceMotion = () => setReduceMotion(prev => !prev);
  return <AccessibilityContext.Provider value={{
    highContrast,
    largeText,
    reduceMotion,
    toggleHighContrast,
    toggleLargeText,
    toggleReduceMotion
  }}>
      {children}
    </AccessibilityContext.Provider>;
};