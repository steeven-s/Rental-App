
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import customerBookingService from "../../services/customerBookingService";
import "./CustomerBookings.css";

function CustomerBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [cancellingBookingId, setCancellingBookingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await customerBookingService.getMyBookings();

            const bookingList = Array.isArray(response)
                ? response
                : response?.bookings || response?.data || [];

            setBookings(bookingList);
        } catch (err) {
            console.error("Failed to load bookings:", err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to load your bookings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (booking) => {
        const confirmed = window.confirm(
            `Are you sure you want to cancel booking #${booking.bookingId} for ${booking.carBrand} ${booking.carModel}?`
        );

        if (!confirmed) return;

        try {
            setCancellingBookingId(booking.bookingId);
            setError("");
            setSuccess("");

            const response =
                await customerBookingService.cancelBooking(booking.bookingId);

            setSuccess(
                response?.message || 
                `Booking #${booking.bookingId} cancelled successfully.`
            );

            // Refresh the booking list after cancellation.
            const updatedResponse =
                await customerBookingService.getMyBookings();

            const updatedBookings = Array.isArray(updatedResponse)
                ? updatedResponse
                : updatedResponse?.bookings || updatedResponse?.data || [];

            setBookings(updatedBookings);

        } catch (err) {
            console.error("Booking cancellation failed:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to cancel this booking. Please try again."
            );
        } finally {
            setCancellingBookingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR"
        });

    const getStatusClass = (status) =>
        `booking-status ${String(status || "").toLowerCase()}`;

    const canCancelBooking = (booking) => {
        const status = String(booking.status || "").toUpperCase();

        const cancellableStatus =
            status === "PENDING" || status === "CONFIRMED";

        const pickupTime = new Date(booking.pickupDateTime);

        return (
            cancellableStatus &&
            !Number.isNaN(pickupTime.getTime()) &&
            pickupTime > new Date()
        );
    };

    if (loading) {
        return (
            <div className="customer-bookings-page">
                <div className="bookings-message">
                    Loading your bookings...
                </div>
            </div>
        );
    }

    return (
        <div className="customer-bookings-page">
            <div className="bookings-header">
                <div>
                    <h1>My Bookings</h1>
                    <p>View and manage your car rental bookings.</p>
                </div>

                <button
                    className="browse-cars-btn"
                    onClick={() => navigate("/customer/cars")}
                >
                    Browse Cars
                </button>
            </div>

            {success && (
                <div className="booking-success-message">
                    {success}
                </div>
            )}

            {error && (
                <div className="bookings-error">
                    {error}
                    <button onClick={fetchBookings}>Retry</button>
                </div>
            )}

            {!error && bookings.length === 0 && (
                <div className="empty-bookings">
                    <h2>No bookings yet</h2>
                    <p>Your car rental bookings will appear here.</p>
                    <button onClick={() => navigate("/customer/cars")}>
                        Explore Cars
                    </button>
                </div>
            )}

            {!error && bookings.length > 0 && (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div
                            className="booking-card"
                            key={booking.bookingId}
                        >
                            <div className="booking-card-header">
                                <div>
                                    <h2>
                                        {booking.carBrand} {booking.carModel}
                                    </h2>
                                    <span>
                                        Booking #{booking.bookingId}
                                    </span>
                                </div>

                                <span className={getStatusClass(booking.status)}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="booking-details-grid">
                                <div>
                                    <label>Pickup</label>
                                    <p>{formatDate(booking.pickupDateTime)}</p>
                                </div>

                                <div>
                                    <label>Return</label>
                                    <p>{formatDate(booking.returnDateTime)}</p>
                                </div>

                                <div>
                                    <label>Pricing Type</label>
                                    <p>
                                        {booking.pricingType?.replace("_", " ")}
                                    </p>
                                </div>

                                <div>
                                    <label>Rental Type</label>
                                    <p>
                                        {booking.rentalType?.replace("_", " ")}
                                    </p>
                                </div>
                            </div>

                            <div className="booking-card-footer">
                                <div>
                                    <label>Total Amount</label>
                                    <strong>
                                        {formatAmount(booking.totalAmount)}
                                    </strong>
                                </div>

                                <div>
                                    <label>Booked On</label>
                                    <span>{formatDate(booking.createdAt)}</span>
                                </div>
                            </div>

                            {canCancelBooking(booking) && (
                                <div className="booking-actions">
                                    <button
                                        className="cancel-booking-btn"
                                        onClick={() =>
                                            handleCancelBooking(booking)
                                        }
                                        disabled={
                                            cancellingBookingId === booking.bookingId
                                        }
                                    >
                                        {cancellingBookingId === booking.bookingId
                                            ? "Cancelling..."
                                            : "Cancel Booking"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomerBookings;
