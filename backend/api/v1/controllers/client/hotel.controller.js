const Hotel = require("../../model/hotel.model");
const Room = require("../../model/rooms.model");
const ModelHotel = require("../../model/model-hotel.model");
const Promotion = require("../../model/promotion.model");
const ModelRoom = require("../../model/model-room.model");
const Amenity = require("../../model/amenity.model");
const Review = require("../../model/review.model");
const User = require("../../model/user.model");

const hotelHelper = require("../../../../helpers/client/hotel");

const normalizeKeyWordHelper = require("../../../../helpers/client/normalize-keyword");

// [GET] /api/v1/management-hotel/hotel
module.exports.index = async (req, res) => {
  const hotels = await Hotel.find({
    status: "APPROVED",
    blocked: false,
  }).select("description hotel_address hotel_name price star_level thumbnail");

  if (hotels.length === 0) {
    return res.json({
      status: 400,
      message: "Danh sách khách sạn trống!",
    });
  }

  for (let i = 0; i < hotels.length; i++) {
    hotels[i] = await hotelHelper.getMinPrice(hotels[i]);
  }

  res.json({
    status: 200,
    hotels,
    message: "Lấy ra danh sách khách sạn thành công!",
  });
};

// [GET] /api/v1/management-hotel/hotel/search?location=
module.exports.search = async (req, res) => {
  const { location } = req.query;
  const locationLowerCase = location.toLowerCase();

  if (!location) {
    return res.status(400).json({
      message: "Lỗi không có query!",
    });
  }
  const hotels = await Hotel.find({
    status: "APPROVED",
    blocked: false,
  });

  let hotelSearched = [];

  for (let i = 0; i < hotels.length; i++) {
    if (
      hotels[i].hotel_address.toLocaleLowerCase().includes(location) ||
      hotels[i].slug.includes(location.split(" ").join("-"))
    ) {
      hotelSearched.push(hotels[i]);
    }
  }
  if (hotelSearched.length === 0) {
    return res.status(400).json({
      message: "Không có khách sạn phù hợp!",
    });
  }
  res.status(200).json({
    message: `Danh sách các khách sạn đã tìm kiếm theo từ khóa ${location}`,
    listHotelSearched: hotelSearched,
  });
};

// [GET] /api/v1/management-hotel/hotel/detail/:id-hotel
module.exports.detail = async (req, res) => {
  const { id_hotel } = req.params;

  if (!id_hotel) {
    return res.json({
      status: 400,
      message: "Không có thông tin của khách sạn này!"
    });
  }

  // lấy chi tiết khách sạn
  let detailHotel = await Hotel.findOne({
    blocked: false,
    _id: id_hotel,
  });

  if (!detailHotel) {
    return res.json({
      status: 400,
      message: "Không có thông tin chi tiết về khách sạn này!",
    });
  }

  // lấy phòng có giá thấp nhất
  const HotelHasMinPrice = await hotelHelper.getMinPrice(detailHotel);

  if (HotelHasMinPrice) {
    detailHotel = HotelHasMinPrice;
  }

  // lấy danh sách phòng
  let listRoomOfHotel = await Room.find({
    blocked: false,
    id_hotel,
  });

  // xử lý từng phòng
  listRoomOfHotel = await Promise.all(
    listRoomOfHotel.map(async (room) => {

      room = room.toObject();

      // lấy loại phòng
      const modelOfRoom = await ModelRoom.findOne({
        _id: room.id_room_type,
      });

      if (modelOfRoom) {
        room.type_room = modelOfRoom.type_room;
      }

      // lấy tiện nghi riêng của từng phòng
      const amenities = await Amenity.find({
        _id: { $in: room.id_amenities },
      });

      room.list_amenity = amenities.map(
        (item) => item.name_amenity
      );

      return room;
    })
  );

  res.json({
    status: 200,
    detailHotel,
    listRoomOfHotel,
    message: "Lấy ra chi tiết khách sạn thành công!",
  });
};

// [GET] /api/v1/management-hotel/hotel/model-hotel/:slug
module.exports.searchByModelHotel = async (req, res) => {
  const { slug } = req.params;

  const modelHotelBySlug = await ModelHotel.findOne({
    slug,
  }).select("model_hotel");

  if (!slug) {
    return res.status(400).json({
      message: "Loại hình khách sạn không tồn tại!",
    });
  }

  const hotelByModelHotel = await Hotel.find({
    status: "APPROVED",
    blocked: false,
    id_model_hotel: modelHotelBySlug._id,
  });
  if (!hotelByModelHotel) {
    return res.status(400).json({
      message: "Không có khách sạn cho loại hình này!",
    });
  }
  res.status(200).json({
    hotelByModelHotel,
    message: `Lấy ra danh sách khách sạn theo mô hình ${modelHotelBySlug.model_hotel}`,
  });
};

// [GET] /api/v1/management-hotel/hotel/location/:slug
module.exports.searchByLocation = async (req, res) => {
  const { slug } = req.params;
  console.log(slug)
  
  const location = normalizeKeyWordHelper
    .normalizeKeyWord(slug)
    .split(" ")
    .join("-");
  const hotels = await Hotel.find({
    status: "APPROVED",
    blocked: false,
    slug: {
      $regex: location,
      $options: "i",
    },
  });

  for (let i = 0; i < hotels.length; i++) {
    hotels[i] = await hotelHelper.getMinPrice(hotels[i]);
    const modelOfHotel = await ModelHotel.findOne({
      _id: hotels[i].id_model_hotel,
    });
    if (modelOfHotel) {
      hotels[i].model_hotel = modelOfHotel.model_hotel;
    }
  }

  res.json({
    status: 200,
    hotels,
    message: `Lấy ra danh sách khách sạn theo địa chỉ thành công!`,
  });
};

// [GET] /api/v1/management-hotel/hotel/sale
module.exports.sale = async (req, res) => {
  try {
    const promotions = await Promotion.find();

    const hotels = await Hotel.aggregate([
      {
        $match: {
          status: "APPROVED",
          blocked: false,
        },
      },

      // JOIN ROOM
      {
        $lookup: {
          from: "rooms",
          let: {
            hotelId: { $toString: "$_id" },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$id_hotel", "$$hotelId"],
                },
              },
            },
          ],
          as: "rooms",
        },
      },

      // Chỉ lấy hotel có room
      {
        $match: {
          "rooms.0": { $exists: true },
        },
      },

      // Min price
      {
        $addFields: {
          minPrice: {
            $min: "$rooms.price",
          },
        },
      },

      // Ẩn rooms
      {
        $project: {
          rooms: 0,
        },
      },
    ]);

    const hotelsWithPromotion = hotels
      .map((hotel) => {

        const promotionsOfHotel = promotions.filter((promotion) =>
          promotion.for_hotels.some(
            (id) => id.toString() === hotel._id.toString()
          )
        );

        if (promotionsOfHotel.length === 0) {
          return null;
        }

        const bestPromotion = promotionsOfHotel.reduce((max, current) => {
          return current.discount_percent > max.discount_percent
            ? current
            : max;
        });

        return {
          ...hotel,
          price: hotel.minPrice,
          discount_percent: bestPromotion.discount_percent,
          promotion_code: bestPromotion.code,
        };
      })
      .filter(Boolean);

    hotelsWithPromotion.sort(
      (a, b) => b.discount_percent - a.discount_percent
    );

    // const topHotels = hotelsWithPromotion.slice(0, 4);

    res.json({
      status: 200,
      hotels: hotelsWithPromotion,
      message: "Danh sách khách sạn có ưu đãi lớn!",
    });

  } catch (error) {
    console.log(error);

    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
