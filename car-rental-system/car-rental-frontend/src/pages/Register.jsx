
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../services/authService";
import Brand from "../components/Brand";
import "./Login.css";

function Register() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (
            formData.phone &&
            !/^[0-9]{10}$/.test(formData.phone)
        ) {
            setError("Phone number must contain 10 digits.");
            return;
        }

        try {
            setLoading(true);

            await authService.register({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.trim()
            });

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: location.state
                });
            }, 1200);

        } catch (err) {
            if (err.response?.status === 409) {
                setError("An account with this email already exists.");
            } else if (err.response?.status === 400) {
                setError(
                    err.response?.data?.message ||
                    "Please check the information you entered."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="auth-brand">
                    <Brand variant="light" align="center" />
                </div>

                <h2>Create Account</h2>
                <p className="auth-subtitle">
                    Join SCAN rentals and tourism
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            maxLength={150}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={72}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>

                </form>

                <p className="register-link">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        state={location.state}
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;
