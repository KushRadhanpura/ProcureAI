import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const role = localStorage.getItem('userRole');
    return role ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;