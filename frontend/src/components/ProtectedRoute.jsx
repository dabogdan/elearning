import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const isAuthenticated = !!localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;

// import React from 'react';
// import { Navigate } from 'react-router-dom';

// function ProtectedRoute({ children }) {
//     const isAuthenticated = !!localStorage.getItem('access_token');

//     return isAuthenticated ? children : <Navigate to="/login" />;
// }

// export default ProtectedRoute;
