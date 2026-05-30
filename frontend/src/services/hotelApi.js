import axiosClient from './axiosClient';

export const hotelApi = {
    getRooms: (params = {}) => {
        const url = '/hotels/rooms/';
        return axiosClient.get(url, { params });
    },

    getRoomDetail: (id) => {
        const url = `/hotels/rooms/${id}/`;
        return axiosClient.get(url);
    },

    createBooking: (bookingData) => {
        const url = '/hotels/bookings/';
        return axiosClient.post(url, bookingData);
    },

    getMyBookings: () => {
        const url = '/hotels/bookings/';
        return axiosClient.get(url);
    },

    cancelBooking: (id) => {
        const url = `/hotels/bookings/${id}/cancel/`; 
        return axiosClient.patch(url, {}); 
    },

    postReview: (reviewData) => {
        const url = '/hotels/reviews/';
        return axiosClient.post(url, reviewData);
    },

    getRoomReviews: (roomId) => {
        const url = '/hotels/reviews/';
        return axiosClient.get(url, { params: { room_id: roomId } });
    }
};

export default hotelApi;