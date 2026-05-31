import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1/management-hotel/admin" : import.meta.env.VITE_API_URL + "admin",
});

request.interceptors.response.use((response) => {
  return response.data;
},
  (error) => {
    console.log(error);
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

export const authApiAdmin = {
  login: async (account) => {
    const res = await request.post("/auth/login", account);
    return res;
  },
};

export const AccountApiAdmin = {
  myAccount: async (id_admin) => {
    const res = await request.get(`/account/my-account/${id_admin}`);
    return res;
  },
  changePassword: async (id_admin, password) => {
    const res = await request.put(
      `/account/change-password/${id_admin}`,
      password,
    );
    return res;
  },
  updateProfile: async (id_admin,infoAdmin) => {
    const res = await request.put(`/account/change-info/${id_admin}`,infoAdmin);
    return res;
  },
  updateStatusAccount: async (infoAccount) => {
    const res = await request.put(`/account/update-status`,infoAccount);
    return res;
  }

};

export const HotelApiAdmin = {
  getAllHotelOfPartner: async (status) => {
    const res = await request.get(`/hotel`,{
      params: {
        status
      }
    });
    return res;
  },
  updateChangeStatusHotel: async (id_hotel,status) => {
    const res = await request.put(`/hotel/operation/${id_hotel}`,{
        status
    });
    return res;
  }
};

export const UserApiAdmin = {
    getAllUser: async () => {
        try{
            const res = await request.get("/account");
            return res;
        }
        catch(error){
            throw new Error(error);
        }
    },
    createAdmin: async (infoAccount) => {
        try{
            const res = await request.post("/account/create",infoAccount);
            return res;
        }
        catch(error){
            throw new Error(error);
        }
    }
}

export const ModelHotelApiAdmin = {
  getAllModelHotel: async () => {
    const res = await request.get("/model-hotel");
    return res;
  },
  createModelHotel: async (infoModelHotel) => {
    const res = await request.post("/model-hotel/create",infoModelHotel);
    return res;
  },
  updateModelHotel: async (id_model_hotel,infoModelHotel) => {
    const res = await request.put(`/model-hotel/edit/${id_model_hotel}`,infoModelHotel);
    return res;
  }
}

export const AmenityApiAdmin = {
  getAllAmenity: async () => {
    const res = await request.get("/amenity");
    return res;
  },
  createAmenity: async (infoAmenity) => {
    const res = await request.post("/amenity/create",infoAmenity);
    return res;
  },
  updateAmenity: async (id_amenity,infoAmenity) => {
    const res = await request.put(`/amenity/edit/${id_amenity}`,infoAmenity)
    return res;
  },
  changeStatusAmenity: async (id_amenity,status) => {
    const res = await request.put(`/amenity/change-status/${id_amenity}`,{
      status
    })
    return res;
  }
}

export const DashboardApiAdmin = {
  getDashboard: async () => {
    const res = await request.get("/dashboard");
    return res;
  },
  getRevenueOfYear: async (year) => {
    const res = await request.get("/dashboard/revenue-of-year",{
      params: {
        year
      }
    });
    return res;
  },
  getTopHotelRevenue: async (year) => {
    const res = await request.get("/dashboard/top-hotel-revenue",{
      params: {
        year
      }
    });
    return res;
  }
}

export const RevenueReportApiAdmin = {
  getRevenueReport: async () => {
    const res = await request.get("/revenue-report");
    return res;
  },

  getRevenueReportByFilter: async (start,end,id_hotel) => {
    console.log(start,end,id_hotel)
    const res = await request.get(`/revenue-report/filter`,{
      params: {
        start,
        end,
        id_hotel
      }
    });
    return res;
  }
}
