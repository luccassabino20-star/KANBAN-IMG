import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [user, setUser] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const status = await api.getAuthStatus();
      if (status.needsSetup) {
        setNeedsSetup(true);
        setUser(null);
        return;
      }
      setNeedsSetup(false);
      try {
        setUser(await api.getMe());
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function setupMaster(data) {
    const u = await api.setupMaster(data);
    setNeedsSetup(false);
    setUser(u);
  }
  async function registerSelf(data) {
    setUser(await api.registerSelf(data));
  }
  async function login(data) {
    setUser(await api.login(data));
  }
  async function logout() {
    await api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ loading, needsSetup, user, setupMaster, registerSelf, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
