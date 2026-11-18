
import { useEffect, useMemo, useState } from "react";
import adminBookingService from "../../services/adminBookingService";
import "./AdminBookings.css";

const EMPLOYEES = ["Naveen", "Charan", "Ashok", "Steeven"];

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

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

    const getDisplayValue = (value) => {
        return value && String(value).trim() ? value : "NA";
    };

    const setBookingLoading = (bookingId, action, value) => {
        setActionLoading(previous => ({
            ...previous,
            [`${bookingId}-${action}`]: value
        }));
    };

    const handleApprove = async (booking) => {
        const bookingId = booking.bookingId;

        if (booking.status !== "PENDING") return;

        try {
            setBookingLoading(bookingId, "status", true);
            setError("");
            setSuccessMessage("");

            await adminBookingService.approveBooking(bookingId);

            setBookings(previous =>
                previous.map(item =>
                    item.bookingId === bookingId
                        ? { ...item, status: "CONFIRMED" }
                        : item
                )
            );

            setSuccessMessage(
                `Booking #${bookingId} approved successfully.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to approve booking."
            );
        } finally {
            setBookingLoading(bookingId, "status", false);
        }
    };

    const handleReject = async (booking) => {
        const bookingId = booking.bookingId;

        if (booking.status !== "PENDING") return;

        const confirmed = window.confirm(
            `Are you sure you want to reject booking #${bookingId}? This will cancel the booking.`
        );

        if (!confirmed) return;

        try {
            setBookingLoading(bookingId, "status", true);
            setError("");
            setSuccessMessage("");

            await adminBookingService.rejectBooking(bookingId);

            setBookings(previous =>
                previous.map(item =>
                    item.bookingId === bookingId
                        ? { ...item, status: "CANCELLED" }
                        : item
                )
            );

            setSuccessMessage(
                `Booking #${bookingId} rejected and cancelled successfully.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reject booking."
            );
        } finally {
            setBookingLoading(bookingId, "status", false);
        }
    };

    const handleAssign = async (bookingId, assignedTo) => {
        if (!assignedTo) return;

        const booking = bookings.find(
            item => item.bookingId === bookingId
        );

        if (!booking || booking.assignedTo === assignedTo) return;

        try {
            setBookingLoading(bookingId, "assign", true);
            setError("");
            setSuccessMessage("");

            await adminBookingService.assignBooking(
                bookingId,
                assignedTo
            );

            setBookings(previous =>
                previous.map(item =>
                    item.bookingId === bookingId
                        ? { ...item, assignedTo }
                        : item
                )
            );

            setSuccessMessage(
                `Booking #${bookingId} assigned to ${assignedTo}.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign employee."
            );
        } finally {
            setBookingLoading(bookingId, "assign", false);
        }
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

            {/* Messages */}
            {error && (
                <div className="booking-error">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="booking-success">
                    {successMessage}
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
                                <th>Owner Details</th>
                                <th>Rental Period</th>
                                <th>Pricing</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredBookings.map(booking => {
                                const bookingId = booking.bookingId;

                                const statusLoading =
                                    !!actionLoading[`${bookingId}-status`];

                                const assignLoading =
                                    !!actionLoading[`${bookingId}-assign`];

                                return (
                                    <tr key={bookingId}>

                                        {/* Booking Details */}
                                        <td>
                                            <strong>#{bookingId}</strong>
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

                                        {/* Car Owner Details */}
                                        <td>
                                            <strong>
                                                {getDisplayValue(booking.carOwnerName)}
                                            </strong>

                                            {booking.carOwnerMobileNumber &&
                                            String(booking.carOwnerMobileNumber).trim() ? (
                                                <a
                                                    href={`tel:${booking.carOwnerMobileNumber}`}
                                                    className="booking-owner-phone"
                                                    title="Call car owner"
                                                >
                                                    📞 {booking.carOwnerMobileNumber}
                                                </a>
                                            ) : (
                                                <small className="booking-no-phone">
                                                    NA
                                                </small>
                                            )}
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

                                        {/* Assigned Employee */}
                                        <td>
                                            <select
                                                className="booking-assigned-select"
                                                value={booking.assignedTo || ""}
                                                disabled={assignLoading}
                                                onChange={(event) =>
                                                    handleAssign(
                                                        bookingId,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Unassigned
                                                </option>

                                                {EMPLOYEES.map(employee => (
                                                    <option
                                                        key={employee}
                                                        value={employee}
                                                    >
                                                        {employee}
                                                    </option>
                                                ))}
                                            </select>

                                            {assignLoading && (
                                                <small>Saving...</small>
                                            )}
                                        </td>

                                        {/* Approve / Reject Actions */}
                                        <td>
                                            {booking.status === "PENDING" ? (
                                                <div className="booking-action-buttons">

                                                    <button
                                                        type="button"
                                                        className="booking-approve-btn"
                                                        title="Approve booking"
                                                        aria-label={`Approve booking ${bookingId}`}
                                                        disabled={statusLoading}
                                                        onClick={() => handleApprove(booking)}
                                                    >
                                                        ✓
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="booking-reject-btn"
                                                        title="Reject booking"
                                                        aria-label={`Reject booking ${bookingId}`}
                                                        disabled={statusLoading}
                                                        onClick={() => handleReject(booking)}
                                                    >
                                                        ✕
                                                    </button>

                                                    {statusLoading && (
                                                        <small>Processing...</small>
                                                    )}
                                                </div>
                                            ) : (
                                                <small className="booking-processed">
                                                    Processed
                                                </small>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })}
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
