
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminAddCar from "./pages/admin/AdminAddCar";
import AdminEditCar from "./pages/admin/AdminEditCar";
import AdminBookings from "./pages/admin/AdminBookings";

// Customer imports
import CustomerCars from "./pages/customer/CustomerCars";
import CustomerCarDetails from "./pages/customer/CustomerCarDetails";
import CustomerCarBooking from "./pages/customer/CustomerCarBooking";
import CustomerBookings from "./pages/customer/CustomerBookings";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ================= PUBLIC PAGES ================= */}

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ================= CUSTOMER PAGES ================= */}

                <Route
                    path="/customer/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/cars"
                    element={
                        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                            <CustomerCars />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/cars/:id"
                    element={
                        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                            <CustomerCarDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/cars/:id/book"
                    element={
                        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                            <CustomerCarBooking />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/bookings"
                    element={
                        <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                            <CustomerBookings />
                        </ProtectedRoute>
                    }
                />


                {/* ================= ADMIN PAGES ================= */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Default admin route */}
                    <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                    />

                    {/* Admin Dashboard */}
                    <Route
                        path="dashboard"
                        element={<AdminDashboard />}
                    />

                    {/* Car Management */}
                    <Route
                        path="cars"
                        element={<AdminCars />}
                    />

                    {/* Add Car */}
                    <Route
                        path="cars/add"
                        element={<AdminAddCar />}
                    />

                    {/* Edit Car */}
                    <Route
                        path="cars/edit/:id"
                        element={<AdminEditCar />}
                    />

                    {/* Booking Management */}
                    <Route
                        path="bookings"
                        element={<AdminBookings />}
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
