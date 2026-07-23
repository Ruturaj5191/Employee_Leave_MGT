import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest, logout as logoutRequest, fetchMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    setError("");
    try {
      const userData = await loginRequest(username, password);
      setUser(userData);
      return userData;
    } catch (err) {
      const message =
        err.response?.data?.detail || "Invalid username or password. Please try again.";
      setError(message);
      throw err;
    }
  }

  function logout() {
    logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
