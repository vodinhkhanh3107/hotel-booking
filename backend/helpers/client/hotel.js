const Room = require("../../api/v1/model/rooms.model");

module.exports.getMinPrice = async (hotel) => {
  const room = await Room.aggregate([
    {
      $match: {
        id_hotel: hotel.id || hotel._id,
      },
    },
    {
      $sort: {
        price: 1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        _id: 0,
        price: 1,
      },
    },
  ]);

  if (room.length !== 0) {
    hotel = hotel.toObject();
    hotel.price = room[0].price;
    console.log(hotel);

  }
  return hotel;
};
