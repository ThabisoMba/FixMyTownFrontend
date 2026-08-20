import { createContext, useContext, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fixmytown_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password, role) {
    const { data } = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('fixmytown_token', data.token);
    localStorage.setItem('fixmytown_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(fullName, email, password, phone) {
    const { data } = await api.post('/auth/register', { fullName, email, password, phone });
    localStorage.setItem('fixmytown_token', data.token);
    localStorage.setItem('fixmytown_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('fixmytown_token');
    localStorage.removeItem('fixmytown_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
