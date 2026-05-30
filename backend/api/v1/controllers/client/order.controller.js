const User = require("../../model/user.model");
const Hotel = require("../../model/hotel.model");
const Room = require("../../model/rooms.model");
const ModelRoom = require("../../model/model-room.model");
const Promotion = require("../../model/promotion.model");
const Order = require("../../model/order-room.model");
const Review = require("../../model/review.model");

// [GET] /api/v1/management-hotel/order/checkout
module.exports.checkout = async (req, res) => {
  const {
    id_user,
    id_room,
    check_in_date,
    check_out_date,
    total_amount,
    id_promotion,
    nights,
    sub_total,
    tax,
  } = req.body;
  if (!id_user) {
    return res.json({
      status: 400,
      message: "Chưa có thông tin người đặt hàng!",
    });
  }

  if (!id_room) {
    return res.json({
      status: 400,
      message: "Chưa có thông tin phòng khách sạn!",
    });
  }
  if (!check_in_date) {
    return res.json({
      status: 400,
      message: "Chọn ngày đến khách sạn!",
    });
  }
  if (new Date(check_in_date) < new Date()) {
    return res.json({
      status: 400,
      message: "Không được chọn ngày và thời gian vào trước ngày hiện tại!",
    });
  }
  if (!check_out_date) {
    return res.json({
      status: 400,
      message: "Chọn ngày rời khách sạn!",
    });
  }
  if (new Date(check_out_date) < new Date()) {
    return res.json({
      status: 400,
      message: "Không được chọn ngày và thời gian ra vào trước ngày hiện tại!",
    });
  }
  const existUser = await User.findOne({
    status: "active",
    _id: id_user,
  }).select("full_name email phone thumbnail");

  const room = await Room.findOne({
    _id: id_room,
  });

  if (!room) {
    return res.json({
      status: 400,
      message: "Không có phòng này trong hệ thống!",
    });
  }

  const hotel = await Hotel.findOne({
    _id: room.id_hotel,
  });

  const roomType = await ModelRoom.findOne({
    _id: room.id_room_type,
  });

  if (!id_promotion) {
    const promotion = await Promotion.findOne({
      status: "available",
      blocked: false,
      _id: id_promotion,
    });
  }

  const totalOrder = await Order.countDocuments();

  const newCodeOrder = "#BK" + String(Number(totalOrder) + 1).padStart(3, "0");
  const InfoOrder = new Order({
    code_order: newCodeOrder,
    id_user,
    id_hotel: room.id_hotel,
    id_room,
    check_in_date,
    check_out_date,
    total_amount: total_amount,
    id_promotion: id_promotion ? id_promotion : "",
    nights,
    sub_total,
    tax,
  });

  await InfoOrder.save();

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

  res.json({
    newCodeOrder,
    status: 201,
    message: "Đặt phòng thành công!",
  });
};

module.exports.cancelOrder = async (req,res) => {
  const { id_order } = req.params;

  if(!id_order){
    return res.json({
      status: 400,
      message: "Đơn hàng không có trong hệ thống!"
    });
  };

  await Order.findOneAndUpdate({
    _id: id_order,
  }, {
    $set: { status: "CANCELLED" }
  });

  res.json({
    status: 200,
    message: "Hủy đặt phòng thành công!"
  })

}

// [GET] /api/v1/management-hotel/order/my-order
module.exports.myOrder = async (req, res) => {
  const { id_user } = req.params;
  const { status } = req.query;
  // cập nhật trang thái đơn hàng nếu quá ngày ra
  const now = new Date();

  await Order.updateMany(
    {
      id_user,
      check_out_date: { $lte: now },
    },
    {
      $set: { status: "COMPLETED" },
    },
  );
  // cập nhật trang thái đơn hàng nếu quá ngày ra

  let oderByIdUser = [];
  if (status) {
    oderByIdUser = await Order.find({
      id_user,
      status,
    });
  } else {
    oderByIdUser = await Order.find({
      id_user,
    });
  }
  for (let i = 0; i < oderByIdUser.length; i++) {
    const hotel = await Hotel.findOne({
      _id: oderByIdUser[i].id_hotel,
    });

    let promoton = {};
    if(oderByIdUser[i]?.id_promotion){
      promotion = await Promotion.findOne({
        _id: oderByIdUser[i].id_promotion,
      });
    }

    
    const review = await Review.findOne({
      id_order: oderByIdUser[i].id,
    });

    oderByIdUser[i] = oderByIdUser[i].toObject();

    if (review) {
      oderByIdUser[i].rating = review.rating;
      oderByIdUser[i].comment = review.comment;
    }
    oderByIdUser[i].hotel_name = hotel.hotel_name;
    oderByIdUser[i].hotel_address = hotel.hotel_address;
    oderByIdUser[i].code_promotion = promoton ? promoton.code : "";
  }
  res.json({
    status: 200,
    orders: oderByIdUser,
    message: "Lấy ra danh sách lịch sử đặt phòng thành công!",
  });
};

// [GET] /api/v1/management-hotel/order/detail/:code_order
module.exports.detailOrder = async (req, res) => {
  const { code_order } = req.params;

  const order = await Order.findOne({
    code_order: `#${code_order}`,
  });

  if (!order) {
    return res.json({
      status: 400,
      message: "Đơn không có trong hệ thống!",
    });
  }
  const userByOrder = await User.findOne({
    _id: order.id_user,
  });

  const hotelByOrder = await Hotel.findOne({
    _id: order.id_hotel,
  }).select("_id hotel_name");

  const roomByOrder = await Room.findOne({
    _id: order.id_room,
  }).select("_id number_room");

  let promotionByOrder = {};
  if(order?.id_promotion){
    promotionByOrder = await Promotion.findOne({
      _id: order.id_promotion,
    }).select("_id code discount_percent");
  }

  const orderDetail = {
    code_order: order.code_order,
    hotel_name: hotelByOrder.hotel_name,
    number_room: roomByOrder.number_room,
    promotion: (promotionByOrder.code && promotionByOrder.discount_percent) ? {
      code: promotionByOrder.code,
      discount_percent: promotionByOrder.discount_percent,
    } : null,
    nights: order.nights,
    sub_total: order.sub_total,
    tax: order.tax,
    user: userByOrder.full_name,
    total_amount: order.total_amount,
  };

  return res.json({
    status: 200,
    orderDetail,
    message: "Lấy chi tiết đơn hàng thành công1",
  });
};
