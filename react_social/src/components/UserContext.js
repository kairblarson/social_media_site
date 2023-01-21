import { useState, createContext } from "react";

const UserContext = createContext(null);
//this is how you create the context

//nav done //local done
export function UserContextProvider({ children }) {
    //the children object prop is all the children elements that this provider is wrapped around
    const [user, setUser] = useState({
        username: "wallen7",
    });

    const login = ({ user }) => {
        console.log("LOGIN");
        //setUser(user);
    };

    const logout = () => {
        console.log("LOGOUT");
        //setUser({});
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
    );
}
//the value prop is an object with whatever info you want passed down into the children

export default UserContext;
//Adding user context to this project might be too large of a hassle well see