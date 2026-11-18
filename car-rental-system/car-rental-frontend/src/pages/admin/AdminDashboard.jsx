
import { useEffect, useState } from "react";
import Brand from "../../components/Brand";
import adminCarService from "../../services/adminCarService";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [carStats, setCarStats] = useState({
        totalCars: 0,
        availableCars: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCarStats();
    }, []);

    const fetchCarStats = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await adminCarService.getAllCars();

            // Support both direct array and wrapped API responses
            const cars = Array.isArray(response)
                ? response
                : response?.data || response?.cars || [];

            const totalCars = cars.length;

            const availableCars = cars.filter(
                car => car.status?.toUpperCase() === "AVAILABLE"
            ).length;

            setCarStats({
                totalCars,
                availableCars
            });

        } catch (err) {
            console.error("Dashboard car statistics error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load car statistics."
            );
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        {
            title: "Total Cars",
            value: loading ? "..." : carStats.totalCars,
            icon: "🚗"
        },
        {
            title: "Available Cars",
            value: loading ? "..." : carStats.availableCars,
            icon: "✅"
        },
        {
            title: "Total Bookings",
            value: "0",
            icon: "📅"
        },
        {
            title: "Total Customers",
            value: "0",
            icon: "👥"
        }
    ];

    return (
        <div className="admin-dashboard">

            <div className="admin-dashboard-brand">
                <Brand variant="light" align="left" />
            </div>

            <div className="admin-dashboard-heading">
                <h2>Dashboard Overview</h2>

                <p>
                    Manage your SCAN rentals and tourism business from here.
                </p>
            </div>

            {error && (
                <div className="booking-error">
                    {error}
                </div>
            )}

            <div className="admin-dashboard-cards">

                {cards.map((card) => (
                    <div
                        className="admin-dashboard-card"
                        key={card.title}
                    >
                        <h3>
                            <span>{card.icon}</span>
                            {card.title}
                        </h3>

                        <h1>{card.value}</h1>
                    </div>
                ))}

            </div>

        </div>
    );
}

export default AdminDashboard;
