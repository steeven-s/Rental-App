
import { useState } from "react";
import adminCarService from "../../services/adminCarService";

function AdminAddCar() {

    const initialFormData = {
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
    };

    const [formData, setFormData] = useState(initialFormData);

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name in formData.pricing) {
            setFormData((prev) => ({
                ...prev,
                pricing: {
                    ...prev.pricing,
                    [name]: value
                }
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

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

            await adminCarService.createCar(payload);

            setSuccessMessage("Car added successfully!");
            setFormData(initialFormData);

        } catch (error) {
            console.error("Error creating car:", error);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to add car. Please check the details and try again."
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

    return (
        <div style={{ padding: "25px", maxWidth: "1000px" }}>

            <h2>Add New Car</h2>
            <p>Enter the car details and rental pricing.</p>

            {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
            )}

            {errorMessage && (
                <p style={{ color: "red" }}>{errorMessage}</p>
            )}

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
                            placeholder="e.g. Toyota"
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
                            placeholder="e.g. Innova Crysta"
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
                            placeholder="e.g. TS09AB1234"
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
                            name="seatingCapacity"
                            min="1"
                            max="20"
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
                    placeholder="Enter car description"
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
                                name={name}
                                min="0.01"
                                step="0.01"
                                value={formData.pricing[name]}
                                onChange={handleChange}
                                placeholder={`Enter ${label.toLowerCase()}`}
                                required
                            />
                        </div>
                    ))}

                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        marginTop: "25px",
                        padding: "12px 25px",
                        background: submitting ? "#999" : "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: submitting ? "not-allowed" : "pointer"
                    }}
                >
                    {submitting ? "Saving..." : "Save Car"}
                </button>

            </form>

        </div>
    );
}

export default AdminAddCar;
