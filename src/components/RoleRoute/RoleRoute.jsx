import { Navigate } from "react-router-dom";

import Loader from "../Loader/Loader";
import { useAuth } from "../../context/AuthContext";

const RoleRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking access..." />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
