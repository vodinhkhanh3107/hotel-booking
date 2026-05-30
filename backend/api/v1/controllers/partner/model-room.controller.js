const ModelRoom = require("../../model/model-room.model");

// [GET] /api/v1/management-hotel/model-room
module.exports.index = async (req, res) => {
  const { id_partner, status } = req.query;
  console.log(id_partner);
  let modelRooms = [];
  if (!status) {
    modelRooms = await ModelRoom.find({
      id_partner,
    });
  } else {
    modelRooms = await ModelRoom.find({
      id_partner,
      status
    });
  }
  console.log(modelRooms);
  if (!modelRooms) {
    return res.json({
      status: 400,
      message: "Danh sách loại phòng trống",
    });
  }
  res.json({
    status: 200,
    modelRooms,
    message: "Lấy ra danh sách loại phòng thành công!",
  });
};

// [POST] /api/v1/management-hotel/model-room/create
module.exports.create = async (req, res) => {
  const { id_partner, type_room, description } = req.body;

  if (!id_partner) {
    return res.json({
      status: 400,
      message: "Không tìm thấy đối tác trong hệ thống",
    });
  }

  if (!type_room || type_room === "") {
    return res.json({
      status: 400,
      message: "Vui lòng điền tên loại phòng",
    });
  }
  if (!description || description === "") {
    return res.json({
      status: 400,
      message: "Vui lòng điền mô tả loại phòng",
    });
  }

  const typeRoomExist = await ModelRoom.findOne({
    type_room,
  });
  if (typeRoomExist) {
    return res.json({
      status: 400,
      message: "Loại phòng này đã tồn tại",
    });
  }

  const newModelRoom = new ModelRoom(req.body);
  await newModelRoom.save();
  res.json({
    status: 201,
    message: "Tạo mới loại phòng thành công!",
  });
};

// [POST] /api/v1/management-hotel/model-room/edit
module.exports.update = async (req, res) => {
  const { type_room, description } = req.body;
  const { id_room_type } = req.params;
  if (!type_room || type_room === "") {
    return res.json({
      status: 400,
      message: "Vui lòng điền tên loại phòng",
    });
  }
  if (!description || description === "") {
    return res.json({
      status: 400,
      message: "Vui lòng điền mô tả loại phòng",
    });
  }

  const typeRoomExist = await ModelRoom.findOne({
    _id: { $ne: id_room_type },
    type_room: type_room.trim(),
  });
  if (typeRoomExist) {
    return res.json({
      status: 400,
      message: "Loại phòng này đã tồn tại",
    });
  }

  await ModelRoom.findOneAndUpdate(
    {
      _id: id_room_type,
    },
    {
      $set: { type_room, description },
    },
  );
  res.json({
    status: 201,
    message: "Cập nhật loại phòng thành công!",
  });
};

// [POST] /api/v1/management-hotel/model-room/update-status
module.exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const { id_room_type } = req.params;

  if (!id_room_type) {
    return res.json({
      status: 400,
      message: "Không tìm thấy thông tin loại phòng này",
    });
  }
  await ModelRoom.findOneAndUpdate(
    {
      _id: id_room_type,
    },
    {
      $set: { status },
    },
  );
  res.json({
    status: 201,
    message: "Thay đổi trạng thái loại phòng thành công!",
  });
};
