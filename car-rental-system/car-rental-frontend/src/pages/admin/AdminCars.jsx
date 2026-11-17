
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminCarService from "../../services/adminCarService";
import "./AdminCars.css";

function AdminCars() {

    const navigate = useNavigate();

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const [deletingCarId, setDeletingCarId] = useState(null);

    // Image management
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [images, setImages] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState("");
    const [imageSuccess, setImageSuccess] = useState("");

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Revoke temporary preview URLs when they are replaced or removed
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    // Fetch cars
    const fetchCars = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminCarService.getAllCars();
            setCars(data);

        } catch (err) {
            console.error("Error fetching cars:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to load cars. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "#16a34a";
            case "UNAVAILABLE":
                return "#dc2626";
            case "MAINTENANCE":
                return "#d97706";
            default:
                return "#64748b";
        }
    };

    // Search and filters
    const filteredCars = cars.filter(car => {

        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            `${car.brand} ${car.model}`.toLowerCase().includes(searchValue) ||
            (car.registrationNumber || "").toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "ALL" ||
            car.status === statusFilter;

        const matchesCategory =
            categoryFilter === "ALL" ||
            car.category?.toUpperCase() === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Delete car
    const handleDeleteCar = async (car) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${car.brand} ${car.model}?`
        );

        if (!confirmed) return;

        try {
            setDeletingCarId(car.id);

            await adminCarService.deleteCar(car.id);

            setCars(prev =>
                prev.filter(item => item.id !== car.id)
            );

        } catch (err) {
            console.error("Error deleting car:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Unable to delete car. Please try again."
            );

        } finally {
            setDeletingCarId(null);
        }
    };

    // Open image manager
    const openImageManager = async (car) => {

        setSelectedCar(car);
        setShowImageModal(true);

        setImages([]);
        setSelectedFiles([]);
        setPreviewUrls([]);

        setImageError("");
        setImageSuccess("");
        setImageLoading(true);

        try {
            const data = await adminCarService.getCarImages(car.id);
            setImages(data);

        } catch (err) {
            console.error("Error loading images:", err);

            setImageError(
                err.response?.data?.message ||
                "Unable to load car images."
            );

        } finally {
            setImageLoading(false);
        }
    };

    // Refresh images
    const refreshImages = async () => {

        if (!selectedCar) return;

        try {
            setImageLoading(true);

            const data = await adminCarService.getCarImages(
                selectedCar.id
            );

            setImages(data);

        } catch (err) {
            console.error("Error refreshing images:", err);
            setImageError("Unable to refresh images.");

        } finally {
            setImageLoading(false);
        }
    };

    // Select images
    const handleFileChange = (e) => {

        const files = Array.from(e.target.files || []);

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const validFiles = [];
        const invalidMessages = [];

        files.forEach(file => {

            if (!allowedTypes.includes(file.type)) {
                invalidMessages.push(
                    `${file.name}: Only JPG, PNG and WEBP are allowed.`
                );
            } else if (file.size > 5 * 1024 * 1024) {
                invalidMessages.push(
                    `${file.name}: Maximum file size is 5 MB.`
                );
            } else {
                validFiles.push(file);
            }
        });

        setPreviewUrls(
            validFiles.map(file => URL.createObjectURL(file))
        );

        setSelectedFiles(validFiles);

        setImageError(invalidMessages.join(" "));

        // Allow selecting the same file again
        e.target.value = "";
    };

    // Upload multiple images
    const handleUploadImages = async () => {

        if (!selectedCar || selectedFiles.length === 0) {
            setImageError("Please select at least one image.");
            return;
        }

        setUploading(true);
        setImageError("");
        setImageSuccess("");

        let successCount = 0;
        const failedFiles = [];

        try {

            for (const file of selectedFiles) {

                try {
                    await adminCarService.uploadCarImage(
                        selectedCar.id,
                        file
                    );

                    successCount++;

                } catch (err) {
                    console.error(
                        `Failed to upload ${file.name}:`,
                        err
                    );

                    failedFiles.push(file.name);
                }
            }

            await refreshImages();

            setSelectedFiles([]);
            setPreviewUrls([]);

            if (failedFiles.length === 0) {
                setImageSuccess(
                    `${successCount} image(s) uploaded successfully.`
                );
            } else {
                setImageError(
                    `${successCount} uploaded. Failed: ${failedFiles.join(", ")}`
                );
            }

        } finally {
            setUploading(false);
        }
    };

    // Set primary image
    const handleSetPrimary = async (imageId) => {

        try {
            setImageError("");
            setImageSuccess("");

            await adminCarService.setPrimaryImage(
                selectedCar.id,
                imageId
            );

            await refreshImages();

            setImageSuccess("Primary image updated successfully.");

        } catch (err) {
            console.error("Error setting primary image:", err);

            setImageError(
                err.response?.data?.message ||
                "Unable to set primary image."
            );
        }
    };

    // Delete image
    const handleDeleteImage = async (image) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this image?"
        );

        if (!confirmed) return;

        try {
            setImageError("");
            setImageSuccess("");

            await adminCarService.deleteCarImage(
                selectedCar.id,
                image.id
            );

            await refreshImages();

            setImageSuccess("Image deleted successfully.");

        } catch (err) {
            console.error("Error deleting image:", err);

            setImageError(
                err.response?.data?.message ||
                "Unable to delete image."
            );
        }
    };

    // Close image manager
    const closeImageManager = () => {

        if (uploading) return;

        setShowImageModal(false);
        setSelectedCar(null);
        setImages([]);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setImageError("");
        setImageSuccess("");
    };

    // Common button style
    const buttonStyle = {
        padding: "9px 13px",
        border: "none",
        borderRadius: "7px",
        cursor: "pointer",
        color: "white",
        fontWeight: "600",
        fontSize: "12px"
    };

    const cellStyle = {
        padding: "16px",
        fontSize: "13px",
        color: "#334155",
        whiteSpace: "nowrap"
    };

    const inputStyle = {
        padding: "11px 13px",
        border: "1px solid #dbe2ec",
        borderRadius: "8px",
        outline: "none",
        background: "#ffffff",
        fontSize: "13px"
    };

    return (

        <div className="admin-cars-page">

            {/* PAGE HEADER */}
            <div className="admin-cars-header">

                <div>
                    <h2>Car Inventory</h2>

                    <p>
                        Manage all vehicles in your rental business.
                    </p>
                </div>

                <div className="admin-header-actions">

                    <button
                        onClick={() => navigate("/admin/cars/add")}
                        className="admin-btn admin-btn-primary"
                    >
                        + Add New Car
                    </button>

                    <button
                        onClick={fetchCars}
                        disabled={loading}
                        className="admin-btn admin-btn-dark"
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>

            {/* STATISTICS */}
            <div className="admin-cars-stats">

                {[
                    {
                        label: "Total Cars",
                        value: cars.length,
                        color: "#2563eb",
                        icon: "🚘"
                    },
                    {
                        label: "Available",
                        value: cars.filter(
                            c => c.status === "AVAILABLE"
                        ).length,
                        color: "#16a34a",
                        icon: "✓"
                    },
                    {
                        label: "Unavailable",
                        value: cars.filter(
                            c => c.status === "UNAVAILABLE"
                        ).length,
                        color: "#dc2626",
                        icon: "⊘"
                    },
                    {
                        label: "Maintenance",
                        value: cars.filter(
                            c => c.status === "MAINTENANCE"
                        ).length,
                        color: "#d97706",
                        icon: "🔧"
                    }
                ].map(item => (

                    <div
                        className="admin-stat-card"
                        key={item.label}
                        style={{
                            borderLeftColor: item.color
                        }}
                    >

                        <div className="admin-stat-top">
                            <span>{item.label}</span>
                            <span>{item.icon}</span>
                        </div>

                        <h2>{item.value}</h2>

                    </div>

                ))}

            </div>

            {/* SEARCH AND FILTERS */}
            <div className="admin-cars-filters">

                <div className="admin-search-box">
                    <span>⌕</span>

                    <input
                        placeholder="Search brand, model or registration number..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    style={inputStyle}
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>

                <select
                    style={inputStyle}
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="ALL">All Categories</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="MUV">MUV</option>
                    <option value="LUXURY">Luxury</option>
                </select>

            </div>

            {/* LOADING */}
            {loading && (
                <div className="admin-message">
                    Loading car inventory...
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (

                <div className="admin-error">
                    {error}

                    <button onClick={fetchCars}>
                        Retry
                    </button>
                </div>

            )}

            {/* EMPTY STATE */}
            {!loading && !error && filteredCars.length === 0 && (

                <div className="admin-empty-state">

                    <div className="admin-empty-icon">🚘</div>

                    <h3>
                        {cars.length === 0
                            ? "No cars available"
                            : "No matching cars found"}
                    </h3>

                    <p>
                        {cars.length === 0
                            ? "Add your first car to start managing inventory."
                            : "Try changing your search or filters."}
                    </p>

                    {cars.length === 0 && (
                        <button
                            onClick={() => navigate("/admin/cars/add")}
                            className="admin-btn admin-btn-primary"
                        >
                            + Add New Car
                        </button>
                    )}

                </div>

            )}

            {/* INVENTORY TABLE */}
            {!loading && !error && filteredCars.length > 0 && (

                <div className="admin-cars-table-wrap">

                    <div className="admin-table-heading">
                        <div>
                            <h3>All Vehicles</h3>
                            <p>{filteredCars.length} vehicle(s) found</p>
                        </div>
                    </div>

                    <table className="admin-cars-table">

                        <thead>
                            <tr>
                                {[
                                    "ID",
                                    "Car",
                                    "Year",
                                    "Category",
                                    "Fuel",
                                    "Transmission",
                                    "Seats",
                                    "Daily Price",
                                    "Status",
                                    "Actions"
                                ].map(header => (

                                    <th key={header}>
                                        {header}
                                    </th>

                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {filteredCars.map(car => (

                                <tr key={car.id}>

                                    <td style={cellStyle}>
                                        #{car.id}
                                    </td>

                                    <td style={{
                                        ...cellStyle,
                                        fontWeight: "700"
                                    }}>
                                        {car.brand} {car.model}
                                    </td>

                                    <td style={cellStyle}>
                                        {car.manufacturingYear}
                                    </td>

                                    <td style={cellStyle}>
                                        {car.category}
                                    </td>

                                    <td style={cellStyle}>
                                        {car.fuelType}
                                    </td>

                                    <td style={cellStyle}>
                                        {car.transmission}
                                    </td>

                                    <td style={cellStyle}>
                                        {car.seatingCapacity}
                                    </td>

                                    <td style={{
                                        ...cellStyle,
                                        fontWeight: "700"
                                    }}>
                                        ₹{car.pricing?.dailyPrice ?? "N/A"}
                                    </td>

                                    <td style={cellStyle}>
                                        <span
                                            className="admin-status"
                                            style={{
                                                background: `${getStatusColor(car.status)}15`,
                                                color: getStatusColor(car.status)
                                            }}
                                        >
                                            {car.status}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    <td style={cellStyle}>

                                        <div className="admin-car-actions">

                                            <button
                                                onClick={() =>
                                                    navigate(`/admin/cars/edit/${car.id}`)
                                                }
                                                className="admin-btn-small admin-btn-edit"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => openImageManager(car)}
                                                className="admin-btn-small admin-btn-images"
                                            >
                                                Images
                                            </button>

                                            <button
                                                onClick={() => handleDeleteCar(car)}
                                                disabled={deletingCarId === car.id}
                                                className="admin-btn-small admin-btn-delete"
                                            >
                                                {deletingCarId === car.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

            {/* IMAGE MANAGEMENT MODAL */}
            {showImageModal && selectedCar && (

                <div
                    className="admin-image-modal"
                    onClick={closeImageManager}
                >

                    <div
                        className="admin-image-modal-content"
                        onClick={e => e.stopPropagation()}
                    >

                        {/* MODAL HEADER */}
                        <div className="admin-modal-header">

                            <div>
                                <h2>Manage Car Images</h2>

                                <p>
                                    {selectedCar.brand} {selectedCar.model}
                                </p>
                            </div>

                            <button
                                onClick={closeImageManager}
                                disabled={uploading}
                                className="admin-modal-close"
                            >
                                ✕
                            </button>

                        </div>

                        {/* ERROR MESSAGE */}
                        {imageError && (
                            <div className="admin-error">
                                {imageError}
                            </div>
                        )}

                        {/* SUCCESS MESSAGE */}
                        {imageSuccess && (
                            <div className="admin-success">
                                {imageSuccess}
                            </div>
                        )}

                        {/* UPLOAD SECTION */}
                        <div className="admin-upload-section">

                            <h3>Upload New Images</h3>

                            <p>
                                Supported formats: JPG, PNG, WEBP.
                                Maximum size: 5 MB per image.
                            </p>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleFileChange}
                                disabled={uploading}
                            />

                            {/* IMAGE PREVIEWS */}
                            {previewUrls.length > 0 && (

                                <div className="admin-preview-grid">

                                    {previewUrls.map((url, index) => (

                                        <div
                                            className="admin-preview-card"
                                            key={url}
                                        >

                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                            />

                                            <p>
                                                {selectedFiles[index]?.name}
                                            </p>

                                        </div>

                                    ))}

                                </div>

                            )}

                            <button
                                onClick={handleUploadImages}
                                disabled={
                                    uploading ||
                                    selectedFiles.length === 0
                                }
                                className="admin-btn admin-btn-primary"
                            >
                                {uploading
                                    ? "Uploading..."
                                    : `Upload ${selectedFiles.length} Image(s)`}
                            </button>

                        </div>

                        {/* EXISTING IMAGES */}
                        <div className="admin-existing-images">

                            <div className="admin-existing-header">
                                <h3>
                                    Uploaded Images ({images.length})
                                </h3>

                                <button
                                    onClick={refreshImages}
                                    disabled={imageLoading}
                                    className="admin-btn admin-btn-dark"
                                >
                                    ↻ Refresh
                                </button>
                            </div>

                            {imageLoading && (
                                <p>Loading images...</p>
                            )}

                            {!imageLoading && images.length === 0 && (

                                <div className="admin-empty-images">
                                    No images uploaded for this car yet.
                                </div>

                            )}

                            {!imageLoading && images.length > 0 && (

                                <div className="admin-image-grid">

                                    {images.map(image => (

                                        <div
                                            className="admin-image-card"
                                            key={image.id}
                                        >

                                            <img
                                                src={image.imageUrl}
                                                alt={`${selectedCar.brand} ${selectedCar.model}`}
                                            />

                                            {image.isPrimary && (
                                                <span className="admin-primary-label">
                                                    ★ Primary Image
                                                </span>
                                            )}

                                            {!image.isPrimary && (
                                                <button
                                                    onClick={() =>
                                                        handleSetPrimary(image.id)
                                                    }
                                                    className="admin-btn-small admin-btn-edit"
                                                >
                                                    Set as Primary
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    handleDeleteImage(image)
                                                }
                                                className="admin-btn-small admin-btn-delete"
                                            >
                                                Delete Image
                                            </button>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                        {/* MODAL FOOTER */}
                        <div className="admin-modal-footer">

                            <button
                                onClick={closeImageManager}
                                disabled={uploading}
                                className="admin-btn admin-btn-dark"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminCars;
