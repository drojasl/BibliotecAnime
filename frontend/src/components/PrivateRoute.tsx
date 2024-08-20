import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../UserContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user_id } = useUser();

  const loggedUserString = user_id > 0;
  const isAuthenticated = !!loggedUserString;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
