// src/context/Context.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  // Load auth data from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setAuth({
        user: JSON.parse(storedUser),
        token: storedToken,
      });
    }
  }, []);

  // Save to localStorage when auth state changes
  useEffect(() => {
    if (auth.user && auth.token) {
      localStorage.setItem("user", JSON.stringify(auth.user));
      localStorage.setItem("token", auth.token);
    }
  }, [auth]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({ user: null, token: "" });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
