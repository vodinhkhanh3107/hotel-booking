import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1/management-hotel/partner" : import.meta.env.VITE_API_URL + "partner",
});

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

export const AuthApiPartner = {
  register: async (infoAccount) => {
    const res = await request.post("/auth/register", infoAccount);
    return res;
  },
  login: async (account) => {
    const res = await request.post("/auth/login", account);
    return res;
  },
};

export const AccountApiPartner = {
  myAccount: async (id_admin) => {
    const res = await request.get(`/account/my-account/${id_admin}`);
    return res;
  },
  changePassword: async (id_admin, password) => {
    const res = await request.post(
      `/account/change-password/${id_admin}`,
      password,
    );
    return res;
  },
  updateInfo: async (id_partner, infoPartner) => {
    const res = await request.put(
      `/account/change-info/${id_partner}`,
      infoPartner,
    );
    return res;
  },
};

export const HotelApiPartner = {
  getAllHotel: async (id_partner, status) => {
    const res = await request.get(`/hotel`, {
      params: {
        id_partner,
        status,
      },
    });
    return res;
  },
  registerHotel: async (infoHotel) => {
    const res = await request.post("/hotel/create", infoHotel);
    return res;
  },
  operationForClient: async (id_order, status, id_room) => {
    const res = await request.post("/hotel/operation", {
      id_order,
      status,
      id_room
    });
    return res;
  },
  updateHotel: async (id_hotel,infoHotel) => {
    const res = await request.put(`/hotel/update/${id_hotel}`,infoHotel);
    return res;
  },
  changeBlockHotel: async (id_hotel,blocked) => {
    const res = await request.put(`/hotel/change-status/${id_hotel}`,{
        blocked
    });
    return res;
  },
  reApprovedHotel: async (id_hotel,obj) => {
    const res = await request.put(`/hotel/re-approved/${id_hotel}`,obj);
    return res;
  },
  

};

export const ModelHotelPartner = {
  getAllModelHotel: async () => {
    const res = await request.get("/model-hotel");
    return res;
  },
};

export const ModelRoomApiPartner = {
  getAllModelRoom: async (id_partner,status) => {
    const res = await request.get(`/model-room`,{
        params: {
            id_partner,
            status
        }
    });
    return res;
  },
  createModelRoom: async (infoModelRoom) => {
    const res = await request.post("/model-room/create", infoModelRoom);
    return res;
  },
  updateModelRoom: async (id_room_type,infoModelRoom) => {
    const res = await request.put(`/model-room/edit/${id_room_type}`, infoModelRoom);
    return res;
  },
  changeStatusModelRoom: async (id_room_type,status) => {
    const res = await request.put(`/model-room/change-status/${id_room_type}`, {
        status
    });
    return res;
  }
};

export const RoomApiPartner = {
  getAllRoom: async (id_hotel) => {
    const res = await request.get(`/room/?id_hotel=${id_hotel}`);
    return res;
  },
  createRoom: async (infoRoom) => {
    const res = await request.post("/room/create", infoRoom);
    return res;
  },
  updateRoom: async (id_room,infoRoom) => {
    const res = await request.put(`/room/edit/${id_room}`, infoRoom);
    return res;
  },
  changeStatus: async (id_room,blocked) => {
    const res = await request.put(`/room/change-status/${id_room}`,{
      blocked
    });
    return res;
  }
};

export const PromotionApiPartner = {
  getAllPromotion: async (id_partner, id_hotel) => {
    const res = await request.get(`/promotion`, {
      params: {
        id_partner,
        id_hotel,
      },
    });
    return res;
  },
  createPromotion: async (infoPromotion) => {
    const res = await request.post("/promotion/create", infoPromotion);
    return res;
  },
  updatePromotion: async (id_promotion,infoPromotion) => {
    const res = await request.put(`/promotion/edit/${id_promotion}`, infoPromotion);
    return res;
  },
  changeStatusPromotion: async (id_promotion,blocked) => {
    const res = await request.put(`/promotion/change-status/${id_promotion}`,{
      blocked
    });
    return res;
  }
};

export const OrderApiPartner = {
  getAllOrder: async (id_partner, status,check_in_date, check_out_date) => {
    const res = await request.get(`/order`, {
      params: {
        id_partner,
        status,
        check_in_date, 
        check_out_date
      },
    });
    return res;
  },

};

export const AmenityApiPartner = {
  getAllAmenites: async (status) => {
    const res = await request.get(`/amenity`,{
        params: {
            status
        }
    });
    return res;
  },
};

export const RevenueReportApiPartner = {
  getRevenueByHotel: async (id_hotel) => {
    const res = await request.get(`revenue-report/${id_hotel}`);
    return res;
  },
};
