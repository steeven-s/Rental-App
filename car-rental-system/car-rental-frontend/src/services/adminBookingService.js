
import axiosInstance from "../api/axiosInstance";

const adminBookingService = {
    getAllBookings: async () => {
        const response = await axiosInstance.get("/admin/bookings");
        return response.data;
    },

    approveBooking: async (bookingId) => {
        const response = await axiosInstance.put(
            `/admin/bookings/${bookingId}/approve`
        );
        return response.data;
    },

    rejectBooking: async (bookingId) => {
        const response = await axiosInstance.put(
            `/admin/bookings/${bookingId}/reject`
        );
        return response.data;
    },

    assignBooking: async (bookingId, assignedTo) => {
        const response = await axiosInstance.put(
            `/admin/bookings/${bookingId}/assign`,
            { assignedTo }
        );
        return response.data;
    }
};

export default adminBookingService;
