const Room = require("../../model/rooms.model");
const ModelRoom = require("../../model/model-room.model");
const Hotel = require("../../model/hotel.model");
const Promotion = require("../../model/promotion.model");

// [GET] /api/v1/management-hotel/room/detail/:id_room
module.exports.detail = async (req, res) => {
  const { id_room } = req.params;
  const roomById = await Room.findOne({
    // status: "inactive",
    _id: id_room,
  });

  if (!roomById) {
    return res.json({
      status: 400,
      message: "Phòng này không có trong hệ thống!",
    });
  }

  const modelOfRoom = await ModelRoom.findOne({
    _id: roomById.id_room_type,
  });

  // cần lấy ra mã giảm giá ở chỗ này
  const promotions = await Promotion.find({
    status: "available",
    blocked: false,
    start_date: { $lte: new Date() },
  });

  const HotelByPromotion = promotions.filter((promotion) =>
    promotion.for_hotels.includes(roomById.id_hotel),
  );
  console.log(HotelByPromotion)

  res.json({
    status: 200,
    message: "Lấy ra chi tiết phòng thành công!",
    room: {
      _id: roomById._id,
      number_room: roomById.number_room,
      type_room: modelOfRoom.type_room,
      price: roomById.price,
      thumbnail: roomById.thumbnail,
    },
    promotions: promotions
      ? HotelByPromotion.map((item) => ({
          _id: item?._id,
          code: item?.code,
          discount_percent: item?.discount_percent,
        }))
      : [],
  });
};
