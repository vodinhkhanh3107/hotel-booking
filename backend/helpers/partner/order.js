const User = require("../../api/v1/model/user.model");
const Hotel = require("../../api/v1/model/hotel.model");
const Room = require("../../api/v1/model/rooms.model");
const ModelRoom = require("../../api/v1/model/model-room.model");

module.exports.getOrder = async (orders) => {
  for (let i = 0; i < orders.length; i++) {
    const user = await User.findOne({
      _id: orders[i].id_user,
    });
    const hotel = await Hotel.findOne({
      _id: orders[i].id_hotel,
    });
    const room = await Room.findOne({
      _id: orders[i].id_room,
    });
    // const modelRoom = ModelRoom.findOne({
    //     _id: orders[i].id_model_room
    // });
    orders[i] = orders[i].toObject();
    orders[i].full_name = user.full_name;
    orders[i].email = user.email;
    // orders[i].type_room = modelRoom.type_room;
    orders[i].hotel_name = hotel.hotel_name;
    orders[i].number_room = room.number_room;
  }

  return orders;
};
