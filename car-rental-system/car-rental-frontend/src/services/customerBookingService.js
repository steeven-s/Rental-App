
import axiosInstance from "../api/axiosInstance";

const customerBookingService = {

    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await axiosInstance.post(
            "/customer/bookings",
            bookingData
        );

        return response.data;
    },

    // Get logged-in customer's bookings
    getMyBookings: async () => {
        const response = await axiosInstance.get(
            "/customer/bookings"
        );

        return response.data;
    },

    cancelBooking: async (bookingId) => {
    const response = await axiosInstance.patch(
        `/customer/bookings/${bookingId}/cancel`
    );
    return response.data;
}

};

export default customerBookingService;
