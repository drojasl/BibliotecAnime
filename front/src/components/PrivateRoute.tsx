import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const loggedUserString = localStorage.getItem("loggedUser");
    const isAuthenticated = !!loggedUserString;

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
