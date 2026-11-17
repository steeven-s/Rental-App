
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {

    const navigate = useNavigate();

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
        { name: "Manage Cars", path: "/admin/cars", icon: "🚗" },
        { name: "Bookings", path: "/admin/bookings", icon: "📅" },
        { name: "Customers", path: "/admin/customers", icon: "👥" },
        { name: "Payments", path: "/admin/payments", icon: "💳" }
    ];

    return (
        <aside style={{
            width: "250px",
            background: "#172033",
            color: "white",
            padding: "24px 16px"
        }}>

            <h2 style={{ marginBottom: "35px" }}>
                Car Rental
            </h2>

            <p style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginBottom: "15px"
            }}>
                ADMIN MENU
            </p>

            {menuItems.map(item => (

                <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                        display: "block",
                        padding: "13px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: "white",
                        background: isActive ? "#334155" : "transparent"
                    })}
                >
                    {item.icon} &nbsp; {item.name}
                </NavLink>

            ))}

            <button
                onClick={() => {
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("user");
                    navigate("/login");
                }}
                style={{
                    marginTop: "40px",
                    width: "100%",
                    padding: "12px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}
            >
                Logout
            </button>

        </aside>
    );
}

export default AdminSidebar;
