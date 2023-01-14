/**
Auth displays either a login/signup button or the current user's address,
depending on whether the user is logged in or not. It uses the `useAuth` hook
from the `AuthContext` to get the current user and to log the user in or out. It
also uses the `Jazzicon` and `jsNumberForAddress` components from the
`react-jazzicon` library to display an icon representing the user's address.
 */
import { useAuth } from "../contexts/AuthContext";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

export function Auth() {
    const { currentUser, logOut, logIn } = useAuth();
    const userAddr = currentUser?.addr;

    return (
        <article>
            {currentUser?.loggedIn ? (
                <div className="grid">
                    <div className="grid" id="left-items">
                        <Jazzicon diameter={32} seed={jsNumberForAddress(userAddr)} />
                        <p id="inner-text">Address: {userAddr || "No Address"}</p>
                    </div>
                    <div>
                        <button onClick={logOut}>Log Out</button>
                    </div>
                </div>
            ) : (
                <div className="grid">
                    <p>Log in amigo!</p>
                    <button className="primary" onClick={logIn}>
                        Log In/Sign Up
                    </button>
                </div>
            )}
        </article>
    );
}
