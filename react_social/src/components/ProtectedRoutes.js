import Home from "./Home";
import Login from "./Login";
import { Outlet, Navigate } from "react-router";

//nav done //local done
export default function ProtectedRoutes() {
    const auth = JSON.parse(localStorage.getItem("userDetails")) || false;
    return  auth.authenticated ? <Outlet /> : <Navigate to="/login" />;
}
//if isAuth is true its going to allow the nested routes to be accessed
//if isAuth is false it will automatically navigate back to the login endpoint
