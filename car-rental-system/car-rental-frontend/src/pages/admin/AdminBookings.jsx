
import { useEffect, useMemo, useState } from "react";
import adminBookingService from "../../services/adminBookingService";
import "./AdminBookings.css";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminBookingService.getAllBookings();

            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load bookings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const summary = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(
            booking => booking.status === "PENDING"
        ).length,
        confirmed: bookings.filter(
            booking => booking.status === "CONFIRMED"
        ).length,
        cancelled: bookings.filter(
            booking => booking.status === "CANCELLED"
        ).length,
        completed: bookings.filter(
            booking => booking.status === "COMPLETED"
        ).length
    }), [bookings]);

    const filters = [
        { label: "All Bookings", value: "ALL" },
        { label: "Pending", value: "PENDING" },
        { label: "Confirmed", value: "CONFIRMED" },
        { label: "Cancelled", value: "CANCELLED" },
        { label: "Completed", value: "COMPLETED" }
    ];

    const filteredBookings = useMemo(() => {
        if (activeFilter === "ALL") {
            return bookings;
        }

        return bookings.filter(
            booking => booking.status === activeFilter
        );
    }, [bookings, activeFilter]);

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";

        return new Date(dateValue).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const getStatusClass = (status) => {
        return `booking-status booking-status-${status?.toLowerCase()}`;
    };

    return (
        <div className="admin-bookings">

            {/* Page Heading */}
            <div className="admin-bookings-heading">
                <div>
                    <h2>Booking Management</h2>
                    <p>
                        View and manage all customer rental bookings.
                    </p>
                </div>

                <button
                    className="booking-refresh-btn"
                    onClick={fetchBookings}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="booking-summary-grid">

                <div className="booking-summary-card">
                    <span>Total Bookings</span>
                    <h2>{summary.total}</h2>
                </div>

                <div className="booking-summary-card pending-card">
                    <span>Pending</span>
                    <h2>{summary.pending}</h2>
                </div>

                <div className="booking-summary-card confirmed-card">
                    <span>Confirmed</span>
                    <h2>{summary.confirmed}</h2>
                </div>

                <div className="booking-summary-card completed-card">
                    <span>Completed</span>
                    <h2>{summary.completed}</h2>
                </div>

                <div className="booking-summary-card cancelled-card">
                    <span>Cancelled</span>
                    <h2>{summary.cancelled}</h2>
                </div>

            </div>

            {/* Booking Filters */}
            <div className="booking-filter-section">
                <h3>All Bookings</h3>

                <div className="booking-filter-buttons">
                    {filters.map(filter => (
                        <button
                            key={filter.value}
                            className={
                                activeFilter === filter.value
                                    ? "booking-filter-btn active"
                                    : "booking-filter-btn"
                            }
                            onClick={() => setActiveFilter(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="booking-error">
                    {error}
                </div>
            )}

            {/* Booking List */}
            {loading ? (
                <div className="booking-message">
                    Loading bookings...
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="booking-empty">
                    <div className="booking-empty-icon">📅</div>
                    <h3>No bookings found</h3>
                    <p>
                        There are no bookings available for this filter.
                    </p>
                </div>
            ) : (

                <div className="booking-table-wrapper">
                    <table className="booking-table">

                        <thead>
                            <tr>
                                <th>Booking</th>
                                <th>Customer</th>
                                <th>Car</th>
                                <th>Rental Period</th>
                                <th>Pricing</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredBookings.map(booking => (

                                <tr key={booking.bookingId}>

                                    {/* Booking Details */}
                                    <td>
                                        <strong>
                                            #{booking.bookingId}
                                        </strong>

                                        <small>
                                            {formatDate(booking.createdAt)}
                                        </small>
                                    </td>

                                    {/* Customer Details */}
                                    <td>
                                        <strong>
                                            {booking.customerName}
                                        </strong>

                                        {booking.customerPhone ? (
                                            <a
                                                href={`tel:${booking.customerPhone}`}
                                                className="booking-customer-phone"
                                                title="Call customer"
                                            >
                                                <span>📞</span>
                                                {booking.customerPhone}
                                            </a>
                                        ) : (
                                            <small className="booking-no-phone">
                                                Phone not available
                                            </small>
                                        )}

                                        <small>
                                            Customer ID: {booking.customerId}
                                        </small>
                                    </td>

                                    {/* Car Details */}
                                    <td>
                                        <strong>
                                            {booking.carBrand} {booking.carModel}
                                        </strong>

                                        <small>
                                            {booking.manufacturingYear}
                                        </small>

                                        <small>
                                            Car ID: {booking.carId}
                                        </small>
                                    </td>

                                    {/* Rental Period */}
                                    <td>
                                        <strong>
                                            Pickup: {formatDate(booking.pickupDateTime)}
                                        </strong>

                                        <small>
                                            Return: {formatDate(booking.returnDateTime)}
                                        </small>
                                    </td>

                                    {/* Pricing Details */}
                                    <td>
                                        <strong>
                                            {booking.pricingType?.replace("_", " ")}
                                        </strong>

                                        <small>
                                            {booking.rentalType?.replace("_", " ")}
                                        </small>
                                    </td>

                                    {/* Amount */}
                                    <td>
                                        <strong>
                                            {formatCurrency(booking.totalAmount)}
                                        </strong>

                                        <small>
                                            Base rate: {formatCurrency(booking.unitPrice)}
                                        </small>
                                    </td>

                                    {/* Booking Status */}
                                    <td>
                                        <span className={getStatusClass(booking.status)}>
                                            {booking.status}
                                        </span>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}

            {/* Results Count */}
            <div className="booking-results-count">
                Showing {filteredBookings.length} of {bookings.length} bookings
            </div>

        </div>
    );
}

export default AdminBookings;
