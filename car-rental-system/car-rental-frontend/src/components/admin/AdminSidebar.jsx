
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {

    const navigate = useNavigate();

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
        { name: "Manage Cars", path: "/admin/cars", icon: "🚗" },
        { name: "Bookings", path: "/admin/bookings", icon: "📅" },
        { name: "Customers", path: "/admin/customers", icon: "👥" },
        { name: "Payments", path: "/admin/payments", icon: "💳" }
    ];

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        navigate("/login");
        onClose();
    };

    return (
        <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>

            <div className="admin-sidebar-heading">
                <h2>Car Rental</h2>

                <button
                    className="admin-sidebar-close"
                    onClick={onClose}
                    aria-label="Close admin menu"
                >
                    ✕
                </button>
            </div>

            <p className="admin-sidebar-label">
                ADMIN MENU
            </p>

            <nav>
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `admin-nav-link ${isActive ? "active" : ""}`
                        }
                    >
                        {item.icon} &nbsp; {item.name}
                    </NavLink>
                ))}
            </nav>

            <button
                className="admin-logout-btn"
                onClick={handleLogout}
            >
                Logout
            </button>

        </aside>
    );
}

export default AdminSidebar;
