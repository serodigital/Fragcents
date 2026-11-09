import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedAuth = localStorage.getItem("auth");

        if (!storedAuth) {
          setAuthLoading(false);
          return;
        }

        const parsedAuth = JSON.parse(storedAuth);
        let user = parsedAuth.user || null;

        // Read the user ID from the token if it's available
        if (parsedAuth.token) {
          try {
            const tokenParts = parsedAuth.token.split(".");

            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));

              if (payload._id) {
                user = {
                  ...user,
                  _id: payload._id,
                };
              }
            }
          } catch (tokenError) {
            console.error("Could not read user ID from token:", tokenError);
          }
        }

        setAuth({
          ...parsedAuth,
          user,
        });
      } catch (error) {
        console.error("Could not load authentication data:", error);
        localStorage.removeItem("auth");
        setAuth({ user: null, token: "" });
      }

      setAuthLoading(false);
    };

    loadAuth();
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
