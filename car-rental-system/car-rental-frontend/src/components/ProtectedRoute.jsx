
import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {

    const token = sessionStorage.getItem("accessToken");

    const userData = sessionStorage.getItem("user");

    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        if (user.role === "ADMIN") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (user.role === "CUSTOMER") {
            return <Navigate to="/customer/dashboard" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
