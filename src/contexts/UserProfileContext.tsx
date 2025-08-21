import React, { useEffect, useState, createContext, useContext } from 'react';
import { storage } from '../services/StorageService';
// Create context
const UserProfileContext = createContext(null);
// Provider component
export const UserProfileProvider = ({
  children
}) => {
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Load user data from storage
    const storedRole = storage.get('user_role', 'family');
    const userData = storage.get('user_data', {});
    const storedUserId = storage.get('user_id', '');
    setUserRole(storedRole);
    setUserName(userData.name || 'User');
    setUserId(storedUserId);
    setIsLoading(false);
  }, []);
  // Add updateUserProfile function
  const updateUserProfile = profile => {
    // Update the state
    setUserRole(profile.relationship || 'family');
    setUserName(profile.name || 'User');
    setUserId(profile.id || userId);
    // Save to storage
    storage.save('user_role', profile.relationship || 'family');
    storage.save('user_name', profile.name || 'User');
    // Update user_data in storage
    const existingUserData = storage.get('user_data', {});
    const updatedUserData = {
      ...existingUserData,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      relationship: profile.relationship,
      responsibilities: profile.responsibilities,
      availabilityPattern: profile.availabilityPattern
    };
    storage.save('user_data', updatedUserData);
  };
  // Create userProfile object for backward compatibility
  const userProfile = {
    id: userId,
    name: userName,
    relationship: userRole
  };
  const value = {
    userRole,
    userName,
    userId,
    isLoading,
    userProfile,
    updateUserProfile // Add the missing function
  };
  return <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>;
};
// Hook for using the context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === null) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};