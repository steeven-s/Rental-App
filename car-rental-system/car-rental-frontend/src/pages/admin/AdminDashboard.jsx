
import Brand from "../../components/Brand";
import "./AdminDashboard.css";

function AdminDashboard() {
    const cards = [
        { title: "Total Cars", value: "0", icon: "🚗" },
        { title: "Available Cars", value: "0", icon: "✅" },
        { title: "Total Bookings", value: "0", icon: "📅" },
        { title: "Total Customers", value: "0", icon: "👥" }
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

            <div className="admin-dashboard-cards">

                {cards.map((card) => (
                    <div className="admin-dashboard-card" key={card.title}>

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
