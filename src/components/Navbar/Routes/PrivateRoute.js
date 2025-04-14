import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser } = useAuth(); // Using your AuthContext

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;