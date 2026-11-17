
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import customerCarService from "../../services/CustomerCarService";
import customerBookingService from "../../services/customerBookingService";

import "./CustomerCarBooking.css";

const RENTAL_TYPES = [
    { value: "HALF_DAY", label: "Half Day (12 Hours)", description: "Fixed 12-hour rental" },
    { value: "DAILY", label: "Daily", description: "Each started 24-hour period" },
    { value: "WEEKLY", label: "Weekly", description: "7-day blocks plus remaining days" },
    { value: "MONTHLY", label: "Monthly", description: "Calendar months plus remaining days" }
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toLocalDateTimeValue(date) {
    const pad = value => String(value).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function addCalendarMonths(date, months) {
    const result = new Date(date);
    const originalDay = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + months);

    const lastDay = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
    ).getDate();

    result.setDate(Math.min(originalDay, lastDay));

    return result;
}

function calculateBillableDays(milliseconds) {
    if (milliseconds <= 0) {
        return 0;
    }

    return Math.ceil(milliseconds / DAY_IN_MS);
}

function calculateEstimatedAmount(pricing, pricingType, pickup, returnDate) {
    if (!pricing || !pickup || !returnDate) {
        return null;
    }

    const start = new Date(pickup);
    const end = new Date(returnDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
    ) {
        return null;
    }

    const duration = end.getTime() - start.getTime();
    const dailyPrice = Number(pricing.dailyPrice || 0);

    let amount = 0;

    switch (pricingType) {
        case "HALF_DAY":
            if (duration !== 12 * 60 * 60 * 1000) {
                return null;
            }

            amount = Number(pricing.halfDayPrice || 0);
            break;

        case "DAILY":
            amount = calculateBillableDays(duration) * dailyPrice;
            break;

        case "WEEKLY": {
            let cursor = new Date(start);
            let weeks = 0;

            while (cursor.getTime() + 7 * DAY_IN_MS <= end.getTime()) {
                cursor = new Date(cursor.getTime() + 7 * DAY_IN_MS);
                weeks++;
            }

            const remainingDays = calculateBillableDays(
                end.getTime() - cursor.getTime()
            );

            amount =
                weeks * Number(pricing.weeklyPrice || 0) +
                remainingDays * dailyPrice;

            break;
        }

        case "MONTHLY": {
            let cursor = new Date(start);
            let months = 0;

            while (true) {
                const nextMonth = addCalendarMonths(cursor, 1);

                if (nextMonth.getTime() > end.getTime()) {
                    break;
                }

                cursor = nextMonth;
                months++;
            }

            const remainingDays = calculateBillableDays(
                end.getTime() - cursor.getTime()
            );

            amount =
                months * Number(pricing.monthlyPrice || 0) +
                remainingDays * dailyPrice;

            break;
        }

        default:
            return null;
    }

    return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function CustomerCarBooking() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);
    const [pricingType, setPricingType] = useState("HALF_DAY");
    const [pickupDateTime, setPickupDateTime] = useState("");
    const [returnDateTime, setReturnDateTime] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successBooking, setSuccessBooking] = useState(null);

    const minimumDateTime = toLocalDateTimeValue(new Date());

    useEffect(() => {
        let active = true;

        const fetchCar = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await customerCarService.getCarById(id);

                if (active) {
                    setCar(data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.detail ||
                        err.response?.data?.message ||
                        "Unable to load car details."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchCar();

        return () => {
            active = false;
        };
    }, [id]);

    // Half-day rentals always end exactly 12 hours after pickup.
    useEffect(() => {
        if (pricingType === "HALF_DAY" && pickupDateTime) {
            const pickup = new Date(pickupDateTime);

            if (!Number.isNaN(pickup.getTime())) {
                const returnDate = new Date(
                    pickup.getTime() + 12 * 60 * 60 * 1000
                );

                setReturnDateTime(toLocalDateTimeValue(returnDate));
            }
        }
    }, [pricingType, pickupDateTime]);

    const estimatedAmount = useMemo(() => {
        return calculateEstimatedAmount(
            car?.pricing,
            pricingType,
            pickupDateTime,
            returnDateTime
        );
    }, [car, pricingType, pickupDateTime, returnDateTime]);

    const formatPrice = price => {
        if (price == null || !Number.isFinite(Number(price))) {
            return "Not available";
        }

        return `₹${Number(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const handleRentalTypeChange = value => {
        setPricingType(value);
        setReturnDateTime("");
        setError("");
    };

    const handlePickupChange = value => {
        setPickupDateTime(value);
        setError("");

        if (pricingType !== "HALF_DAY") {
            setReturnDateTime("");
        }
    };

    const handleReturnChange = value => {
        setReturnDateTime(value);
        setError("");
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setError("");

        if (!pickupDateTime || !returnDateTime) {
            setError("Please select pickup and return date/time.");
            return;
        }

        const pickup = new Date(pickupDateTime);
        const returnDate = new Date(returnDateTime);
        const now = new Date();

        if (
            Number.isNaN(pickup.getTime()) ||
            Number.isNaN(returnDate.getTime())
        ) {
            setError("Please select valid pickup and return dates.");
            return;
        }

        if (pickup <= now) {
            setError("Pickup date and time must be in the future.");
            return;
        }

        if (returnDate <= pickup) {
            setError("Return date must be after pickup date.");
            return;
        }

        if (
            pricingType === "HALF_DAY" &&
            returnDate.getTime() - pickup.getTime() !== 12 * 60 * 60 * 1000
        ) {
            setError("Half-day bookings must be exactly 12 hours.");
            return;
        }

        if (estimatedAmount == null) {
            setError(
                "Unable to calculate the rental estimate. Please check the selected dates and car pricing."
            );
            return;
        }

        try {
            setSubmitting(true);

            const bookingData = {
                carId: Number(id),
                pricingType,
                pickupDateTime,
                returnDateTime
            };

            const response =
                await customerBookingService.createBooking(bookingData);

            setSuccessBooking(response);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to create booking. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="booking-message">
                Loading booking details...
            </div>
        );
    }

    if (error && !car) {
        return (
            <div className="booking-message error">
                <h2>Unable to load car</h2>
                <p>{error}</p>
                <button onClick={() => navigate("/customer/cars")}>
                    Back to Cars
                </button>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="booking-message error">
                <h2>Car not found</h2>
                <button onClick={() => navigate("/customer/cars")}>
                    Back to Cars
                </button>
            </div>
        );
    }

    // Booking confirmation screen
    if (successBooking) {
        return (
            <div className="booking-page">
                <div className="booking-confirmation">
                    <div className="confirmation-icon">✓</div>

                    <h1>Booking Created Successfully!</h1>

                    <p>Your booking request has been submitted.</p>

                    <div className="confirmation-details">
                        <div>
                            <span>Booking ID</span>
                            <strong>#{successBooking.bookingId}</strong>
                        </div>

                        <div>
                            <span>Car</span>
                            <strong>{car.brand} {car.model}</strong>
                        </div>

                        <div>
                            <span>Rental Type</span>
                            <strong>{successBooking.pricingType}</strong>
                        </div>

                        <div>
                            <span>Pickup</span>
                            <strong>
                                {new Date(
                                    successBooking.pickupDateTime
                                ).toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <div>
                            <span>Return</span>
                            <strong>
                                {new Date(
                                    successBooking.returnDateTime
                                ).toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <div>
                            <span>Total Amount</span>
                            <strong className="confirmation-amount">
                                {formatPrice(successBooking.totalAmount)}
                            </strong>
                        </div>

                        <div>
                            <span>Booking Status</span>
                            <strong className="pending-status">
                                {successBooking.status}
                            </strong>
                        </div>
                    </div>

                    <div className="confirmation-actions">
                        <button
                            className="primary-button"
                            onClick={() => navigate("/customer/bookings")}
                        >
                            View My Bookings
                        </button>

                        <button
                            className="secondary-button"
                            onClick={() => navigate("/customer/cars")}
                        >
                            Browse More Cars
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-topbar">
                <button
                    className="booking-back-button"
                    type="button"
                    onClick={() => navigate(`/customer/cars/${id}`)}
                >
                    ← Back to Car Details
                </button>
            </div>

            <div className="booking-layout">
                <section className="booking-form-card">
                    <div className="booking-title">
                        <h1>Book Your Car</h1>
                        <p>Select your rental duration and travel dates.</p>
                    </div>

                    {error && (
                        <div className="booking-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Rental duration selector */}
                        <div className="booking-field">
                            <label htmlFor="pricingType">
                                Choose Rental Duration
                            </label>

                            <select
                                id="pricingType"
                                name="pricingType"
                                value={pricingType}
                                onChange={event =>
                                    handleRentalTypeChange(event.target.value)
                                }
                                required
                            >
                                {RENTAL_TYPES.map(type => (
                                    <option
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </option>
                                ))}
                            </select>

                            <small>
                                {RENTAL_TYPES.find(
                                    type => type.value === pricingType
                                )?.description}
                            </small>
                        </div>

                        {/* Pickup date and time */}
                        <div className="booking-field">
                            <label htmlFor="pickupDateTime">
                                Pickup Date & Time
                            </label>

                            <input
                                id="pickupDateTime"
                                type="datetime-local"
                                value={pickupDateTime}
                                min={minimumDateTime}
                                onChange={event =>
                                    handlePickupChange(event.target.value)
                                }
                                required
                            />
                        </div>

                        {/* Return date and time */}
                        <div className="booking-field">
                            <label htmlFor="returnDateTime">
                                Return Date & Time
                            </label>

                            <input
                                id="returnDateTime"
                                type="datetime-local"
                                value={returnDateTime}
                                min={pickupDateTime || minimumDateTime}
                                onChange={event =>
                                    handleReturnChange(event.target.value)
                                }
                                required
                                readOnly={pricingType === "HALF_DAY"}
                            />

                            {pricingType === "HALF_DAY" && (
                                <small>
                                    Return time is automatically set to
                                    12 hours after pickup.
                                </small>
                            )}
                        </div>

                        <div className="booking-policy-note">
                            <strong>Self-drive rental</strong>
                            <p>
                                This booking is for self-drive only.
                                Please ensure that your pickup and return
                                details are correct.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="confirm-booking-button"
                            disabled={submitting || !car}
                        >
                            {submitting
                                ? "Creating Booking..."
                                : "Confirm Booking"}
                        </button>
                    </form>
                </section>

                {/* Booking summary */}
                <aside className="booking-summary-card">
                    <h2>Booking Summary</h2>

                    <div className="booking-car-summary">
                        {car.images?.length > 0 ? (
                            <img
                                src={
                                    car.images.find(image => image.isPrimary)
                                        ?.imageUrl ||
                                    car.images[0].imageUrl
                                }
                                alt={`${car.brand} ${car.model}`}
                            />
                        ) : (
                            <div className="booking-no-image">
                                No Image
                            </div>
                        )}

                        <div>
                            <h3>{car.brand} {car.model}</h3>
                            <span>
                                {car.manufacturingYear} · {car.category}
                            </span>
                        </div>
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-row">
                        <span>Rental Type</span>
                        <strong>
                            {RENTAL_TYPES.find(
                                type => type.value === pricingType
                            )?.label}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>Pickup</span>
                        <strong>
                            {pickupDateTime
                                ? new Date(pickupDateTime).toLocaleString("en-IN")
                                : "Not selected"}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>Return</span>
                        <strong>
                            {returnDateTime
                                ? new Date(returnDateTime).toLocaleString("en-IN")
                                : "Not selected"}
                        </strong>
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-total">
                        <span>Estimated Total</span>
                        <strong>{formatPrice(estimatedAmount)}</strong>
                    </div>

                    <p className="summary-note">
                        This is an estimate. The final rental amount is
                        calculated and validated by the server when you
                        confirm your booking.
                    </p>
                </aside>
            </div>
        </div>
    );
}

export default CustomerCarBooking;
