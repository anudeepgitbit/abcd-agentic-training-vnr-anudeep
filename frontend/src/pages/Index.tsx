// This is now a redirect page - users should go to /dashboard
import { Navigate } from "react-router-dom";

const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
