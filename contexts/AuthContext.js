import * as fcl from "@onflow/fcl";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [currentUser, setUser] = useState({
        loggedIn: false,
        addr: undefined,
    });

    useEffect(() => fcl.currentUser.subscribe(setUser), []);

    const logOut = async () => {
        fcl.unauthenticate();
        setUser({ addr: undefined, loggedIn: false });
    };

    const logIn = () => {
        fcl.logIn();
    };

    const signUp = () => {
        fcl.signUp();
    };

    const value = {
        currentUser,
        logOut,
        logIn,
        signUp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
