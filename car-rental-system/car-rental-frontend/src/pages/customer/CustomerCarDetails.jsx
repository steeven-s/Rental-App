
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customerCarService from "../../services/CustomerCarService";
import "./CustomerCarDetails.css";

function CustomerCarDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch car details
    useEffect(() => {

        const fetchCarDetails = async () => {

            try {
                setLoading(true);
                setError("");

                const data = await customerCarService.getCarById(id);

                setCar(data);

                const primaryImage = data.images?.find(
                    image => image.isPrimary
                );

                setSelectedImage(
                    primaryImage?.imageUrl ||
                    data.images?.[0]?.imageUrl ||
                    ""
                );

            } catch (err) {

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Unable to load car details."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchCarDetails();

    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="car-details-message">
                Loading car details...
            </div>
        );
    }

    // Error state
    if (error || !car) {
        return (
            <div className="car-details-message error">

                <h2>Car not found</h2>

                <p>
                    {error || "This car is not available."}
                </p>

                <button onClick={() => navigate("/customer/cars")}>
                    Back to Cars
                </button>

            </div>
        );
    }

    // Format price
    const formatPrice = (price) =>
        price != null
            ? `₹${Number(price).toLocaleString("en-IN")}`
            : "Not available";

    return (

        <div className="car-details-page">

            {/* Top Navigation */}
            <div className="details-topbar">

                <button
                    className="back-button"
                    onClick={() => navigate("/customer/cars")}
                >
                    ← Back to Cars
                </button>

            </div>

            <div className="car-details-container">

                {/* Image Gallery */}
                <section className="car-gallery">

                    <div className="main-car-image">

                        {selectedImage ? (

                            <img
                                src={selectedImage}
                                alt={`${car.brand} ${car.model}`}
                            />

                        ) : (

                            <div className="no-car-image">
                                No Image Available
                            </div>

                        )}

                    </div>

                    {/* Image Thumbnails */}
                    {car.images?.length > 1 && (

                        <div className="car-thumbnail-list">

                            {car.images.map(image => (

                                <button
                                    key={image.id}
                                    className={`car-thumbnail ${
                                        selectedImage === image.imageUrl
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedImage(image.imageUrl)
                                    }
                                >

                                    <img
                                        src={image.imageUrl}
                                        alt="Car thumbnail"
                                    />

                                </button>

                            ))}

                        </div>

                    )}

                </section>

                {/* Car Information */}
                <section className="car-information">

                    {/* Car Heading */}
                    <div className="car-heading">

                        <div>

                            <span className="car-category">
                                {car.category}
                            </span>

                            <h1>
                                {car.brand} {car.model}
                            </h1>

                            <p className="car-year">
                                Manufacturing Year: {car.manufacturingYear}
                            </p>

                        </div>

                        <span className="availability-badge">
                            Available
                        </span>

                    </div>

                    {/* Car Specifications */}
                    <div className="car-specifications">

                        <div className="specification-item">

                            <span>Fuel Type</span>

                            <strong>
                                {car.fuelType}
                            </strong>

                        </div>

                        <div className="specification-item">

                            <span>Transmission</span>

                            <strong>
                                {car.transmission}
                            </strong>

                        </div>

                        <div className="specification-item">

                            <span>Seating Capacity</span>

                            <strong>
                                {car.seatingCapacity} Seats
                            </strong>

                        </div>

                        <div className="specification-item">

                            <span>Category</span>

                            <strong>
                                {car.category}
                            </strong>

                        </div>

                    </div>

                    {/* Car Description */}
                    <div className="car-description">

                        <h2>About this car</h2>

                        <p>
                            {car.description || "No description available."}
                        </p>

                    </div>

                    {/* Rental Pricing */}
                    <div className="car-pricing-section">

                        <h2>Rental Pricing</h2>

                        <div className="pricing-grid">

                            {/* Half-Day Price */}
                            <div className="pricing-card">

                                <span>Half-Day</span>

                                <strong>
                                    {formatPrice(car.pricing?.halfDayPrice)}
                                </strong>

                            </div>

                            {/* Daily Price */}
                            <div className="pricing-card featured">

                                <span>Daily</span>

                                <strong>
                                    {formatPrice(car.pricing?.dailyPrice)}
                                </strong>

                            </div>

                            {/* Weekly Price */}
                            <div className="pricing-card">

                                <span>Weekly</span>

                                <strong>
                                    {formatPrice(car.pricing?.weeklyPrice)}
                                </strong>

                            </div>

                            {/* Monthly Price */}
                            <div className="pricing-card">

                                <span>Monthly</span>

                                <strong>
                                    {formatPrice(car.pricing?.monthlyPrice)}
                                </strong>

                            </div>

                        </div>

                        <p className="pricing-note">
                            Final rental charges will be calculated based
                            on your selected rental duration.
                        </p>

                    </div>

                    {/* Booking Action */}
                    <div className="booking-action">

                        <button
                            className="book-now-button"
                            onClick={() =>
                                navigate(`/customer/cars/${car.id}/book`)
                            }
                        >
                            Book Now →
                        </button>

                    </div>

                </section>

            </div>

        </div>

    );
}

export default CustomerCarDetails;
