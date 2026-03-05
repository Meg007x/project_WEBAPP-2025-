// src/auth/ProtectedRoute.tsx
import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { IonSpinner } from "@ionic/react";
import { useAuth } from "./AuthProvider";

type Props = RouteProps & { component: React.ComponentType<any> };

const ProtectedRoute: React.FC<Props> = ({ component: Component, ...rest }) => {
  const { user, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IonSpinner />
            </div>
          );
        }
        return user ? <Component {...props} /> : <Redirect to="/login" />;
      }}
    />
  );
};

export default ProtectedRoute;