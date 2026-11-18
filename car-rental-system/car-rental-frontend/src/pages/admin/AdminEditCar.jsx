
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminCarService from "../../services/adminCarService";

function AdminEditCar() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        manufacturingYear: "",
        registrationNumber: "",
        ownerName: "",
        ownerMobileNumber: "",
        category: "",
        fuelType: "",
        transmission: "",
        seatingCapacity: "",
        description: "",
        pricing: {
            hourlyPrice: "",
            halfDayPrice: "",
            dailyPrice: "",
            weeklyPrice: "",
            monthlyPrice: ""
        }
    });

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Load existing car details
    useEffect(() => {

        const fetchCar = async () => {

            try {
                setLoading(true);
                setErrorMessage("");

                const car = await adminCarService.getCarById(id);

                setFormData({
                    brand: car.brand ?? "",
                    model: car.model ?? "",
                    manufacturingYear: car.manufacturingYear ?? "",
                    registrationNumber: car.registrationNumber ?? "",
                    ownerName: car.ownerName ?? "",
                    ownerMobileNumber: car.ownerMobileNumber ?? "",
                    category: car.category ?? "",
                    fuelType: car.fuelType ?? "",
                    transmission: car.transmission ?? "",
                    seatingCapacity: car.seatingCapacity ?? "",
                    description: car.description ?? "",
                    pricing: {
                        hourlyPrice: car.pricing?.hourlyPrice ?? "",
                        halfDayPrice: car.pricing?.halfDayPrice ?? "",
                        dailyPrice: car.pricing?.dailyPrice ?? "",
                        weeklyPrice: car.pricing?.weeklyPrice ?? "",
                        monthlyPrice: car.pricing?.monthlyPrice ?? ""
                    }
                });

            } catch (error) {
                console.error("Error fetching car:", error);

                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load car details."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchCar();

    }, [id]);

    // Handle normal fields
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle pricing fields
    const handlePricingChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                [name]: value
            }
        }));
    };

    // Update car
    const handleSubmit = async (e) => {

        e.preventDefault();

        setSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {

            const payload = {
                ...formData,
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                manufacturingYear: Number(formData.manufacturingYear),
                registrationNumber: formData.registrationNumber.trim().toUpperCase(),
                ownerName: formData.ownerName.trim(),
                ownerMobileNumber: formData.ownerMobileNumber.trim(),
                seatingCapacity: Number(formData.seatingCapacity),

                pricing: {
                    hourlyPrice: Number(formData.pricing.hourlyPrice),
                    halfDayPrice: Number(formData.pricing.halfDayPrice),
                    dailyPrice: Number(formData.pricing.dailyPrice),
                    weeklyPrice: Number(formData.pricing.weeklyPrice),
                    monthlyPrice: Number(formData.pricing.monthlyPrice)
                }
            };

            await adminCarService.updateCar(id, payload);

            setSuccessMessage("Car details updated successfully!");

        } catch (error) {

            console.error("Error updating car:", error);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to update car. Please try again."
            );

        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        boxSizing: "border-box"
    };

    const fieldStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "18px"
    };

    const pricingFields = [
        ["hourlyPrice", "Hourly Price"],
        ["halfDayPrice", "Half-Day Price"],
        ["dailyPrice", "Daily Price"],
        ["weeklyPrice", "Weekly Price"],
        ["monthlyPrice", "Monthly Price"]
    ];

    if (loading) {
        return <div>Loading car details...</div>;
    }

    if (errorMessage && !formData.brand) {
        return (
            <div style={{ color: "red", padding: "20px" }}>
                {errorMessage}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1000px" }}>

            {successMessage && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                    {successMessage}
                </p>
            )}

            {errorMessage && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                    {errorMessage}
                </p>
            )}

            <h2>Edit Car Details</h2>
            <p>Update the car information and rental pricing.</p>

            <form onSubmit={handleSubmit}>

                {/* BASIC INFORMATION */}
                <h3>Basic Information</h3>

                <div style={gridStyle}>

                    <div style={fieldStyle}>
                        <label>Brand</label>
                        <input
                            style={inputStyle}
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Model</label>
                        <input
                            style={inputStyle}
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Manufacturing Year</label>
                        <input
                            style={inputStyle}
                            type="number"
                            name="manufacturingYear"
                            min="1900"
                            max="2100"
                            value={formData.manufacturingYear}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Registration Number</label>
                        <input
                            style={inputStyle}
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Category</label>
                        <select
                            style={inputStyle}
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="HATCHBACK">Hatchback</option>
                            <option value="SEDAN">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="MUV">MUV</option>
                            <option value="LUXURY">Luxury</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label>Fuel Type</label>
                        <select
                            style={inputStyle}
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Fuel</option>
                            <option value="PETROL">Petrol</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="ELECTRIC">Electric</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="CNG">CNG</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label>Transmission</label>
                        <select
                            style={inputStyle}
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Transmission</option>
                            <option value="MANUAL">Manual</option>
                            <option value="AUTOMATIC">Automatic</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label>Seating Capacity</label>
                        <input
                            style={inputStyle}
                            type="number"
                            min="1"
                            max="20"
                            name="seatingCapacity"
                            value={formData.seatingCapacity}
                            onChange={handleChange}
                            required
                        />
                    </div>

                </div>

                {/* OWNER INFORMATION */}
                <h3 style={{ marginTop: "30px" }}>Owner Information</h3>

                <div style={gridStyle}>

                    <div style={fieldStyle}>
                        <label>Car Owner Name</label>
                        <input
                            style={inputStyle}
                            type="text"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleChange}
                            placeholder="Enter car owner's name"
                            maxLength="150"
                            required
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Owner Mobile Number</label>
                        <input
                            style={inputStyle}
                            type="tel"
                            name="ownerMobileNumber"
                            value={formData.ownerMobileNumber}
                            onChange={handleChange}
                            placeholder="e.g. 9876543210"
                            pattern="^\+?[0-9]{10,15}$"
                            title="Enter 10 to 15 digits, optionally starting with +"
                            maxLength="16"
                            required
                        />
                    </div>

                </div>

                {/* DESCRIPTION */}
                <h3 style={{ marginTop: "30px" }}>Description</h3>

                <textarea
                    style={{ ...inputStyle, minHeight: "100px" }}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />

                {/* PRICING */}
                <h3 style={{ marginTop: "30px" }}>Rental Pricing</h3>

                <div style={gridStyle}>

                    {pricingFields.map(([name, label]) => (
                        <div key={name} style={fieldStyle}>

                            <label>{label} (₹)</label>

                            <input
                                style={inputStyle}
                                type="number"
                                min="0.01"
                                step="0.01"
                                name={name}
                                value={formData.pricing[name]}
                                onChange={handlePricingChange}
                                required
                            />

                        </div>
                    ))}

                </div>

                <div style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "25px"
                }}>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: "12px 25px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: submitting ? "not-allowed" : "pointer"
                        }}
                    >
                        {submitting ? "Updating..." : "Update Car"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/cars")}
                        style={{
                            padding: "12px 25px",
                            background: "#64748b",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    );
}

export default AdminEditCar;
