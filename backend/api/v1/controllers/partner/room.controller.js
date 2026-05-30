const Room = require("../../model/rooms.model");
const ModelRoom = require("../../model/model-room.model");
const Amenity = require("../../model/amenity.model");

// [GET] /api/v1/management-hotel/room
module.exports.index = async (req, res) => {
  const { id_hotel } = req.query;

  let rooms = [];
  if(id_hotel === "undefined"){
    rooms = await Room.find();
  }
  else{
    rooms = await Room.find({
      id_hotel
    });
  };

  for(let i=0;i<rooms.length;i++){
    const modelOfRoom = await ModelRoom.findOne({
      _id: rooms[i].id_room_type
    });

    rooms[i] = rooms[i].toObject();
    rooms[i].type_room = modelOfRoom.type_room

    const idAmenities = rooms[i].id_amenities;
    const amenityOfRoom = [];
    for(let j=0;j<idAmenities.length;j++){
      const amenity = await Amenity.findOne({
        _id: idAmenities[j]
      });
      if(amenity){
        amenityOfRoom.push(amenity.name_amenity);
      }
    }
    rooms[i].amenityOfRoom = amenityOfRoom;

  }
  if (!rooms) {
    return res.json({
      status: 400,
      message: "Không có phòng nào!",
    });
  }
  res.json({
    status: 200,
    rooms,
    message: "Lấy danh sách phòng thành công!",
  });
};

// [POST] /api/v1/management-hotel/room/create
module.exports.create = async (req, res) => {
  const { id_amenities, number_room, id_room_type, capacity, price, blocked, id_hotel, thumbnail } =
    req.body;
    if (!id_amenities || id_amenities === "") {
      return res.json({
        status: 400,
        message: "Hãy chọn tiện nghi cho phòng này!!",
      });
    }
  if (!number_room || number_room === "") {
    return res.json({
      status: 400,
      message: "Số phòng không được để trống!",
    });
  }
  
  if (!id_room_type || id_room_type === "") {
    return res.json({
      status: 400,
      message: "Loại phòng không được để trống!",
    });
  }
  if (!capacity || capacity === "") {
    return res.json({
      status: 400,
      message: "Sức chưa không được để trống!",
    });
  }
  if (!price || price === "") {
    return res.json({
      status: 400,
      message: "Giá không được để trống!",
    });
  }
  if (!id_hotel || id_hotel === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn khách sạn cho phòng!",
    });
  }
  if (!thumbnail || thumbnail === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm hình ảnh cho phòng!",
    });
  }

  const existRoom = await Room.findOne({
    id_hotel,
    number_room
  }).select("number_room");

  if(existRoom){
    return res.json({
      status: 400,
      message: "Số phòng đã tồn tại!",
    });
  }

  const newRoom = await Room({
    id_amenities,
    number_room: String(number_room),
    id_room_type,
    capacity: Number(capacity),
    price: Number(price),
    blocked: !blocked,
    id_hotel,
    thumbnail
  });

  newRoom.save();

  res.json({
    status: 201,
    message: "Tạo mới phòng thành công!"
  })
};

// [PUT] /api/v1/management-hotel/room/edit/:id_room
module.exports.edit = async (req, res) => {
  const { id_amenities, number_room, id_room_type, capacity, price, blocked, id_hotel, thumbnail } =
    req.body;

  const { id_room } = req.params;
    if (!id_amenities || id_amenities === "") {
      return res.json({
        status: 400,
        message: "Hãy chọn tiện nghi cho phòng này!!",
      });
    }
  if (!number_room || number_room === "") {
    return res.json({
      status: 400,
      message: "Số phòng không được để trống!",
    });
  }
  
  if (!id_room_type || id_room_type === "") {
    return res.json({
      status: 400,
      message: "Loại phòng không được để trống!",
    });
  }
  if (!capacity || capacity === "") {
    return res.json({
      status: 400,
      message: "Sức chưa không được để trống!",
    });
  }
  if (!price || price === "") {
    return res.json({
      status: 400,
      message: "Giá không được để trống!",
    });
  }
  if (!id_hotel || id_hotel === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn khách sạn cho phòng!",
    });
  }
  if (!thumbnail || thumbnail === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm hình ảnh cho phòng!",
    });
  }

  const existRoom = await Room.findOne({
    id_hotel,
    number_room,
    _id: { $ne: id_room }
  }).select("id_hotel number_room");
  console.log(existRoom);
  if(existRoom){
    return res.json({
      status: 400,
      message: "Số phòng đã tồn tại!",
    });
  }

  await Room.findOneAndUpdate({
    _id: id_room
  },{
    $set: { ...req.body, blocked: !blocked }
  })

  res.json({
    status: 201,
    message: "Cập nhật phòng thành công!"
  })
};

// [PUT] /api/v1/management-hotel/room/change-status/:id_room
module.exports.changeStatus = async (req, res) => {
  const { blocked } = req.body;
  const { id_room } = req.params;
    
  if(!id_room){
    return res.json({
      code: 400,
      message: "Không tìm thấy thông tin phòng"
    })
  }

  await Room.findOneAndUpdate({
    _id: id_room
  },{
    $set: { blocked: !blocked }
  })

  res.json({
    status: 201,
    message: "Cập nhật phòng thành công!"
  })
};