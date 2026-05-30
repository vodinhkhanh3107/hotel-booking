import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.NODE === "development" ? "http://localhost:5000/api/v1/management-hotel" : import.meta.env.VITE_API_URL,
});

request.interceptors.response.use((response) => {
  return response.data;
},
  (error) => {
    console.log(error);
    // location.href = "http://localhost:5173/404";
    return Promise.reject(error);
});

request.interceptors.request.use(config => {
  return config;
},
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
)

export const AuthApiClient = {
  login: async function(account){
    try{
        const res = await request.post("/auth/login", account);
        return res;
    }
    catch(error){
        throw new Error(error);
    }
  },
  register: async (account) => {
    try{
      const res = await request.post("/auth/register", account);
      return res;
    }
    catch(error){
      throw new Error(error);
    }
  }
  
};

export const AccountApiClient = {
  myAccount: async function(id_user) {
      try{
        const res = await request.get(`/account/my-account/${id_user}`,);
        return res;
      }
      catch(error){
          throw new Error(error);
      }
  },
  changePassword: async function(id_user,password) {
      try{
        const res = await request.put(`/account/change-password/${id_user}`,password);
        return res;
      }
      catch(error){
          throw new Error(error);
      }
  },
  updateInfo: async (id_user, infoUser) => {
    const res = await request.put(`/account/change-info/${id_user}`,infoUser);
    return res;
  }
}


export const HotelApiClient = {
  getAllHotel: async () => {
    const res = await request.get(`/hotel`);
    return res;
  },
  getDetailHotel: async (id_hotel) => {
    const res = await request.get(`/hotel/detail/${id_hotel}`);
    return res;
  },
  searcHotelByLocation: async (location) => {
    const res = await request.get(`/hotel/location/${location}`);
    return res;
  },
  getDiscountHotel: async () => {
    const res = await request.get("/hotel/sale");
    return res;
  },
}

export const ModelHotelApiClient = {
  getAllModelHotel: async () => {
    const res = await request.get("/model-hotel");
    return res;
  },
  getHotelsByModelHotel: async (slug) => {
    const res = await request.get(`/model-hotel/hotel`,{
      params: {
        slug
      }
    });
    return res;
  }
}

export const OrderApiClient = {
  getMyOrder: async (id_user,status) => {
    const res = await request.get(`/order/my-order/${id_user}?status=${status}`);
    return res;
  },
  createBooking: async (infoBooking) => {
    const res = await request.post(`/order/checkout`,infoBooking);
    return res;
  },
  getDetailOrder: async (code_order) => {
    const res = await request.get(`/order/detail/${code_order}`);
    return res;
  },
  cancelOrder: async (id_order) => {
    const res = await request.post(`/order/cancel/${id_order}`);
    return res;
  }

}

export const ReviewApiClient = {
  getReview: async (id_hotel) => {
    const res = await request.get(`/review/hotel/${id_hotel}`);
    return res;
  },
  createReview: async (infoReview) => {
    const res = await request.post("/review/create",infoReview);
    return res;
  }
}

export const RoomApiClient = {
  getDetailRoom: async (id_room) => {
    const res = await request.get(`/room/detail/${id_room}`);
    return res;
  }
}