import {useState, createContext, useContext, useEffect} from "react";

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({
        user: null,
        token:"",
    });
    useEffect( () => {
        const data = localStorage.getItem("auth"); // get data from local Storage
        if(data){ // check if user is logged in
             const pasred = JSON.parse(data); // convert JSON back to JS
             setAuth({...auth, user: pasred.user, token: pasred.token}); // populate the context from local Storage
        }
    },[]);

    return(
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export {useAuth, AuthProvider};