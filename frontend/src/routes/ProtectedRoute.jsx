import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import AppLoader from "../components/common/AppLoader";


const ProtectedRoute = () => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {
    return <AppLoader />;
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return <Outlet />;
};


export default ProtectedRoute;