import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });
  const [authLoading, setAuthLoading] = useState(true);

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
    setAuthLoading(false);
=======
    const loadAuth = () => {
      try {
        const storedAuth = localStorage.getItem("auth");

        if (!storedAuth) {
          setAuthLoading(false);
          return;
        }

        const parsedAuth = JSON.parse(storedAuth);

        let user = parsedAuth.user || null;

       
        if (parsedAuth.token) {
          try {
            const tokenParts = parsedAuth.token.split(".");

            if (tokenParts.length === 3) {
              const payload = JSON.parse(
                atob(tokenParts[1])
              );

              console.log("JWT PAYLOAD:", payload);

              if (payload._id) {
                user = {
                  ...user,
                  _id: payload._id,
                };
              }
            }
          } catch (tokenError) {
            console.error(
              "Could not read user ID from token:",
              tokenError
            );
          }
        }

        const updatedAuth = {
          ...parsedAuth,
          user,
        };

        console.log("AUTH LOADED:");
        console.log(updatedAuth);

        setAuth(updatedAuth);
      } catch (error) {
        console.error(
          "Could not load authentication data:",
          error
        );

        localStorage.removeItem("auth");

        setAuth({
          user: null,
          token: "",
        });
      }

      setAuthLoading(false);
    };

    loadAuth();
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
  }, []);

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem(
        "auth",
        JSON.stringify(auth)
      );
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  const logout = () => {
    setAuth({ user: null, token: "" });
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ auth, setAuth, authLoading, logout }}>
=======
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        authLoading,
      }}
    >
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };