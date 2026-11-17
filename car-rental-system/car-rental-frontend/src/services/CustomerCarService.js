
import axiosInstance from "../api/axiosInstance";

const customerCarService = {

    // Get all available cars
    getAvailableCars: async () => {
        const response = await axiosInstance.get("/cars");
        return response.data;
    },

    // Get individual car details
    getCarById: async (carId) => {
        const response = await axiosInstance.get(`/cars/${carId}`);
        return response.data;
    }

};

export default customerCarService;
