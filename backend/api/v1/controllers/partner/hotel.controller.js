const Hotel = require("../../model/hotel.model");
const Order = require("../../model/order-room.model");
const RevenueReport = require("../../model/revenue-report.model");
const Room = require("../../model/rooms.model");
// [GET] /api/v1/management-hotel/partner/hotel
module.exports.index = async (req, res) => {
  const { id_partner, status } = req.query;
  let hotels = [];
  if (!status) {
    hotels = await Hotel.find({
      id_partner,
    });
  } else {
    
    hotels = await Hotel.find({
      id_partner,
      status,
    }).select("status blocked hotel_name");
  }
  if (!hotels) {
    return res.json({
      status: 400,
      message: "Danh sách khách sạn trống",
    });
  }
  res.json({
    status: 200,
    hotels,
    // hotelActive,
    message: "Lấy ra danh sách khách sạn thành công!",
  });
};

// [POST] /api/v1/management-hotel/partner/hotel/create
module.exports.create = async (req, res) => {
  const {
    id_partner,
    hotel_name,
    id_model_hotel,
    hotel_address,
    star_level,
    percent_permission,
    thumbnail,
    description,
  } = req.body;

  if (!id_partner || id_partner === "") {
    return res.json({
      status: 400,
      message: "Chưa có thông tin người tạo phòng cho khách sạn này!",
    });
  }

  if (!hotel_name || hotel_name === "") {
    return res.json({
      status: 400,
      message: "Hãy điền tên cho khách sạn!",
    });
  }
  if (!id_model_hotel || id_model_hotel === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn loại hình cho khách sạn!",
    });
  }

  if (!hotel_address || hotel_address === "") {
    return res.json({
      status: 400,
      message: "Hãy điền địa chỉ cho khách sạn!",
    });
  }
  if (!star_level || star_level === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn hạng sao cho khách sạn!",
    });
  }
  if (!thumbnail || thumbnail === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm hình ảnh cho khách sạn!",
    });
  }
  if (!description || description === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm mô tả cho khách sạn!",
    });
  }

  const existHotels = await Hotel.find();
  if (existHotels) {
    for (let i = 0; i < existHotels.length; i++) {
      if (existHotels[i].hotel_address === hotel_address) {
        return res.json({
          status: 400,
          message: "Khách sạn ở vị trí này đã tồn tại!",
        });
      }
    }
    const newHotel = new Hotel({
      id_partner,
      hotel_name,
      id_model_hotel,
      hotel_address,
      star_level,
      percent_permission,
      thumbnail,
      description,
    });

    await newHotel.save();

    res.json({
      status: 201,
      message: "Tạo mới khách sạn thành công!",
    });
  }
};

// [POST] /api/v1/management-hotel/partner/hotel/operation
module.exports.operation = async (req, res) => {
  const { id_order, status, id_room } = req.body;

  switch (status) {
    case "APPROVED":
      const order = await Order.findOne({
        _id: id_order,
      });
      const hotelByOrder = await Hotel.findOne({
        _id: order.id_hotel,
      });

      const orderByRevenue = await RevenueReport.findOne({
        code_order: order.code_order,
      });

      if (orderByRevenue) {
        return res.json({
          status: 400,
          message: "Đơn này đã được duyệt trước đó!",
        });
      }

      const newRevenueReport = new RevenueReport({
        code_order: order.code_order,
        id_hotel: hotelByOrder.id,
        transaction_date: order.check_in_date,
        total_amount: order.total_amount,
        percent_permission: hotelByOrder.percent_permission,
        revenue_admin:
          Number(order.total_amount) *
          (Number(hotelByOrder.percent_permission) / 100),
        revenue_partner:
          Number(order.total_amount) -
          Number(order.total_amount) *
            (Number(hotelByOrder.percent_permission) / 100),
      });

      await newRevenueReport.save();

      await Order.updateOne(
        {
          _id: id_order,
        },
        {
          status: "APPROVED",
        },
      );
      // cập nhật lại trạng thái phòng
      await Room.findOneAndUpdate(
        {
          _id: id_room,
        },
        {
          $set: { status: "active" },
        },
      );
      // cập nhật lại trạng thái phòng
      return res.json({
        status: 200,
        message: "Đã duyệt thành công cho đơn đặt phòng này!",
      });
    case "REJECTED":
      await Order.updateOne(
        {
          _id: id_order,
        },
        {
          status: "REJECTED",
        },
      );

      // cập nhật lại trạng thái phòng
      await Room.findOneAndUpdate(
        {
          _id: id_room,
        },
        {
          $set: { status: "inactive" },
        },
      );
      // cập nhật lại trạng thái phòng
      
      return res.json({
        status: 200,
        message: "Từ chối duyệt cho đơn đặt phòng này!",
      });
  }
};

// [PUT] /api/v1/management-hotel/partner/hotel/update/:id_hotel
module.exports.update = async (req, res) => {
  const {
    id_partner,
    hotel_name,
    id_model_hotel,
    hotel_address,
    star_level,
    percent_permission,
    thumbnail,
    description,
  } = req.body;

  const { id_hotel } = req.params;
  console.log(id_hotel)
  if (!id_partner || id_partner === "") {
    return res.json({
      status: 400,
      message: "Chưa có thông tin người tạo phòng cho khách sạn này!",
    });
  }

  if (!hotel_name || hotel_name === "") {
    return res.json({
      status: 400,
      message: "Hãy điền tên cho khách sạn!",
    });
  }
  if (!id_model_hotel || id_model_hotel === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn loại hình cho khách sạn!",
    });
  }

  if (!hotel_address || hotel_address === "") {
    return res.json({
      status: 400,
      message: "Hãy điền địa chỉ cho khách sạn!",
    });
  }
  if (!star_level || star_level === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn hạng sao cho khách sạn!",
    });
  }
  if (!thumbnail || thumbnail === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm hình ảnh cho khách sạn!",
    });
  }
  if (!description || description === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm mô tả cho khách sạn!",
    });
  }

  const existHotels = await Hotel.find({
    _id: { $ne: id_hotel }
  });
  if (existHotels) {
    for (let i = 0; i < existHotels.length; i++) {
      if (existHotels[i].hotel_address === hotel_address) {
        return res.json({
          status: 400,
          message: "Khách sạn ở vị trí này đã tồn tại!",
        });
      }
    }
    
    await Hotel.findOneAndUpdate({
      _id: id_hotel
    },{
      $set: {
        id_partner,
        hotel_name,
        id_model_hotel,
        hotel_address,
        star_level,
        percent_permission,
        thumbnail,
        description,
      }
    })

    res.json({
      status: 201,
      message: "Cập nhật khách sạn thành công!",
    });
  }
};

// [PUT] /api/v1/management-hotel/partner/hotel/change-status/:id_hotel
module.exports.changeStatusHotel = async (req,res) => {
  const { id_hotel } = req.params;
  const { blocked } = req.body;

  if(!id_hotel){
    return res.json({
      status: 400,
      message: "Không tìm thấy thông tin khách sạn"
    });
  }

  await Hotel.findOneAndUpdate({
    _id: id_hotel
  },{
    $set: { blocked }
  });

  res.json({
    status: 200,
    message: "Thay đổi trạng thái khách sạn thành công!"
  });


}

// [PUT] /api/v1/management-hotel/partner/hotel/re-approved/:id_hotel
module.exports.reApproved = async (req,res) => {
  const { id_hotel } = req.params;

  if(!id_hotel){
    return res.json({
      status: 400,
      message: "Không tìm thấy thông tin khách sạn"
    });
  }

  await Hotel.findOneAndUpdate({
    _id: id_hotel
  },{
    $set: { status: "PENDING" }
  });

  res.json({
    status: 200,
    message: "Gửi yêu cầu duyệt lại thành công!"
  });


}
