
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";
import "./Dashboard.css";
import Brand from "../components/Brand";

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(
        sessionStorage.getItem("user") || "null"
    );

    const handleLogout = () => {
        authService.logout();
        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            title: "Dashboard",
            description: "Your rental overview",
            icon: "🏠",
            path: null
        },
        {
            title: "Browse Cars",
            description: "Explore available vehicles",
            icon: "🚘",
            path: "/customer/cars"
        },
        {
            title: "My Bookings",
            description: "View your rental bookings",
            icon: "📋",
            path: "/customer/bookings"
        }
    ];

    return (
        <div className="customer-dashboard">

            {/* Sidebar */}
            <aside className="customer-sidebar">

               <div className="sidebar-brand">
                    <Brand />
                </div>

                <div className="sidebar-section-title">
                    MENU
                </div>

                <nav className="sidebar-navigation">
                    {menuItems.map((item) => (
                        <button
                            key={item.title}
                            className={`sidebar-menu-item ${
                                item.path === null ? "active" : ""
                            }`}
                            onClick={() => {
                                if (item.path) {
                                    navigate(item.path);
                                }
                            }}
                        >
                            <span className="menu-icon">
                                {item.icon}
                            </span>
                            <span>{item.title}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="sidebar-user-info">
                            <strong>{user?.fullName || "Customer"}</strong>
                            <span>Customer</span>
                        </div>
                    </div>

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main Content */}
            <main className="dashboard-main">

                <header className="dashboard-topbar">
                    <div>
                        <h1>Customer Dashboard</h1>
                        <p>Welcome back to your car rental account.</p>
                    </div>

                    <div className="dashboard-profile">
                        <div className="profile-avatar">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span>{user?.fullName || "Customer"}</span>
                    </div>
                </header>

                <section className="dashboard-welcome">
                    <div>
                        <h2>
                            Hello, {user?.fullName || "Customer"}! 👋
                        </h2>

                        <p>
                            Find your perfect car and manage all your
                            rentals from one place.
                        </p>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Quick Access</h2>
                        <p>Navigate to your rental services</p>
                    </div>

                    <div className="dashboard-cards">

                        {/* Browse Cars */}
                        <div className="dashboard-card">
                            <div className="dashboard-card-icon car-icon">
                                🚘
                            </div>

                            <h3>Browse Cars</h3>

                            <p>
                                Explore available cars, compare prices
                                and choose the vehicle you need.
                            </p>

                            <button
                                onClick={() => navigate("/customer/cars")}
                            >
                                Explore Cars →
                            </button>
                        </div>

                        {/* My Bookings */}
                        <div className="dashboard-card">
                            <div className="dashboard-card-icon booking-icon">
                                📋
                            </div>

                            <h3>My Bookings</h3>

                            <p>
                                View your booking history, rental dates,
                                booking status and total amount.
                            </p>

                            <button
                                onClick={() => navigate("/customer/bookings")}
                            >
                                View Bookings →
                            </button>
                        </div>

                    </div>
                </section>

                <section className="dashboard-info">
                    <h3>How it works</h3>

                    <div className="dashboard-steps">
                        <div>
                            <span>01</span>
                            <strong>Browse Cars</strong>
                            <p>Find a car that suits your needs.</p>
                        </div>

                        <div>
                            <span>02</span>
                            <strong>Book Your Car</strong>
                            <p>Select your rental dates and pricing type.</p>
                        </div>

                        <div>
                            <span>03</span>
                            <strong>Track Bookings</strong>
                            <p>Check your booking details and status.</p>
                        </div>
                    </div>
                </section>

                <footer className="dashboard-footer">
                    © {new Date().getFullYear()} Car Rental Management System
                </footer>

            </main>
        </div>
    );
}

export default Dashboard;
