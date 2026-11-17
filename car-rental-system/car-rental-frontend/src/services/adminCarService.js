
import axiosInstance from "../api/axiosInstance";

const BASE_URL = "/admin/cars";

const adminCarService = {

    getAllCars: async () =>
        (await axiosInstance.get(BASE_URL)).data,

    getCarById: async (id) =>
        (await axiosInstance.get(`${BASE_URL}/${id}`)).data,

    createCar: async (data) =>
        (await axiosInstance.post(BASE_URL, data)).data,

    updateCar: async (id, data) =>
        (await axiosInstance.put(`${BASE_URL}/${id}`, data)).data,

    deleteCar: async (id) =>
        (await axiosInstance.delete(`${BASE_URL}/${id}`)).data,

    uploadCarImage: async (carId, file) => {

        const formData = new FormData();

        formData.append("file", file);

        const response = await axiosInstance.post(
            `/admin/cars/${carId}/images`,
            formData,
            {
                headers: {
                    "Content-Type": undefined
                }
            }
        );

        return response.data;
    },

    getCarImages: async (carId) =>
        (await axiosInstance.get(`${BASE_URL}/${carId}/images`)).data,

    setPrimaryImage: async (carId, imageId) =>
        (await axiosInstance.put(
            `${BASE_URL}/${carId}/images/${imageId}/primary`
        )).data,

    deleteCarImage: async (carId, imageId) =>
        (await axiosInstance.delete(
            `${BASE_URL}/${carId}/images/${imageId}`
        )).data
};

export default adminCarService;
