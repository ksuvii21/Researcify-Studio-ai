import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import AppLoader from "../components/common/AppLoader";


const PublicRoute = () => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {
    return <AppLoader />;
  }


  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return <Outlet />;
};


export default PublicRoute;