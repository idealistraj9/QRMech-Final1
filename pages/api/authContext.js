// authContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/user';
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const { data } = useCurrentUser();
  useEffect(() => {
    // Logic to check if the user is authenticated
    // Set the user if authenticated
    const authenticatedUser = data;
    if (authenticatedUser) {
      setUser(authenticatedUser);
    }
  }, [user]);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
