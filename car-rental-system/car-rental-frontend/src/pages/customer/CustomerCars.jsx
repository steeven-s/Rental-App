
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import customerCarService from "../../services/CustomerCarService";
import "./CustomerCars.css";

function CustomerCars() {

    const navigate = useNavigate();

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");
    const [fuelType, setFuelType] = useState("ALL");
    const [transmission, setTransmission] = useState("ALL");

    useEffect(() => {

        const fetchCars = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await customerCarService.getAvailableCars();
                setCars(data);

            } catch (err) {
                console.error("Unable to fetch cars:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load available cars. Please try again."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchCars();

    }, []);

    const filteredCars = useMemo(() => {

        return cars.filter(car => {

            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                `${car.brand} ${car.model}`
                    .toLowerCase()
                    .includes(searchText);

            const matchesCategory =
                category === "ALL" || car.category === category;

            const matchesFuel =
                fuelType === "ALL" || car.fuelType === fuelType;

            const matchesTransmission =
                transmission === "ALL" ||
                car.transmission === transmission;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesFuel &&
                matchesTransmission
            );

        });

    }, [cars, search, category, fuelType, transmission]);

    const getPrimaryImage = (car) => {

        const primaryImage = car.images?.find(
            image => image.isPrimary
        );

        return primaryImage?.imageUrl ||
            car.images?.[0]?.imageUrl ||
            null;
    };

    const resetFilters = () => {
        setSearch("");
        setCategory("ALL");
        setFuelType("ALL");
        setTransmission("ALL");
    };

    return (

        <div className="customer-cars-page">

            {/* HERO SECTION */}
            <section className="cars-hero">

                <div>
                    <span className="cars-hero-tag">
                        FIND YOUR PERFECT RIDE
                    </span>

                    <h1>
                        Explore Our <span>Car Collection</span>
                    </h1>

                    <p>
                        Find the right car for your next journey.
                        Comfortable rides, transparent pricing and easy booking.
                    </p>
                </div>

            </section>

            {/* PAGE HEADING */}
            <div className="cars-section-heading">

                <div>
                    <h2>Available Cars</h2>
                    <p>
                        Choose from our collection of rental vehicles.
                    </p>
                </div>

                <span className="cars-result-count">
                    {filteredCars.length} Vehicles
                </span>

            </div>

            {/* FILTER SECTION */}
            <div className="cars-filter-panel">

                <input
                    type="text"
                    placeholder="Search by brand or model..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option value="ALL">All Categories</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="MUV">MUV</option>
                    <option value="LUXURY">Luxury</option>
                </select>

                <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value)}
                >
                    <option value="ALL">All Fuel Types</option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="CNG">CNG</option>
                    <option value="HYBRID">Hybrid</option>
                </select>

                <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value)}
                >
                    <option value="ALL">All Transmissions</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automatic</option>
                </select>

                <button
                    className="cars-reset-btn"
                    onClick={resetFilters}
                >
                    Reset
                </button>

            </div>

            {/* LOADING */}
            {loading && (
                <div className="cars-state">
                    <div className="cars-loader"></div>
                    <p>Finding available cars...</p>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="cars-state cars-error">
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* EMPTY */}
            {!loading && !error && filteredCars.length === 0 && (
                <div className="cars-state">
                    <div className="cars-empty-icon">🚘</div>
                    <h3>No cars found</h3>
                    <p>Try changing your search or filters.</p>

                    <button
                        className="cars-reset-btn"
                        onClick={resetFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* CAR GRID */}
            {!loading && !error && filteredCars.length > 0 && (

                <div className="customer-car-grid">

                    {filteredCars.map(car => {

                        const image = getPrimaryImage(car);

                        return (

                            <article
                                className="customer-car-card"
                                key={car.id}
                            >

                                <div className="customer-car-image">

                                    {image ? (
                                        <img
                                            src={image}
                                            alt={`${car.brand} ${car.model}`}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="car-no-image">
                                            🚘
                                            <span>Image coming soon</span>
                                        </div>
                                    )}

                                    <span className="car-available-badge">
                                        Available
                                    </span>

                                </div>

                                <div className="customer-car-content">

                                    <div className="customer-car-title">
                                        <div>
                                            <h3>
                                                {car.brand} {car.model}
                                            </h3>

                                            <span>
                                                {car.manufacturingYear}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="customer-car-specs">

                                        <span>👥 {car.seatingCapacity} Seats</span>
                                        <span>⛽ {car.fuelType}</span>
                                        <span>⚙ {car.transmission}</span>
                                        <span>🚘 {car.category}</span>

                                    </div>

                                    <div className="customer-car-footer">

                                        <div className="car-price">

                                            <strong>
                                                ₹{car.pricing?.dailyPrice ?? "N/A"}
                                            </strong>

                                            <span>/ day</span>

                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(`/customer/cars/${car.id}`)
                                            }
                                            className="car-details-btn"
                                        >
                                            View Details →
                                        </button>

                                    </div>

                                </div>

                            </article>

                        );

                    })}

                </div>

            )}

        </div>
    );
}

export default CustomerCars;
