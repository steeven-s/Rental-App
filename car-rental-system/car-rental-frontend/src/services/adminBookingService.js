
import axiosInstance from "../api/axiosInstance";

const adminBookingService = {
    getAllBookings: async () => {
        const response = await axiosInstance.get("/admin/bookings");
        return response.data;
    }
};

export default adminBookingService;
