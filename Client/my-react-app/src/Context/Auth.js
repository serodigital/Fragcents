import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  const logout = () => {
    setAuth({ user: null, token: "" });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
