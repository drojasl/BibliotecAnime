import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const loggedUserString = localStorage.getItem("loggedUser");
    const isAuthenticated = !!loggedUserString;

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
