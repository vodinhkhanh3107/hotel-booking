const ModelHotel = require("../../model/model-hotel.model");

// [GET] /api/v1/management-hotel/model-hotel

module.exports.index = async (req, res) => {
  const modelHotels = await ModelHotel.find();
  if (!modelHotels) {
    return res.json({
      status: 400,
      message: "Không có loại hình khách sạn nào!",
    });
  }
  res.json({
    status: 200,
    modelHotels,
    message: "Lấy danh sách loại hình khách sạn thành công!",
  });
};

// [POST] /api/v1/management-hotel/model-hotel/create
module.exports.create = async (req, res) => {
  const { model_hotel, description, thumbnail } = req.body;
  if (!model_hotel || model_hotel === "") {
    return res.status(400).json({
      message: "Hãy điền thông tin loại hình khách sạn!",
    });
  }
  if (!description || description === "") {
    return res.status(400).json({
      message: "Hãy điền mô tả thông tin loại hình khách sạn!",
    });
  }

  const existingModelHotel = await ModelHotel.findOne({
    model_hotel: model_hotel.trim(),
  });

  if (existingModelHotel) {
    return res.json({
      status: 400,
      message: "Loại hình khách sạn này đã tồn tại",
    });
  }

  const newModelHotel = new ModelHotel(req.body);
  await newModelHotel.save();
  res.json({
    status: 200,
    message: "Tạo mới loại hình khách sạn thành công!",
  });
};

// [POST] /api/v1/management-hotel/model-hotel/edit/:id_model_hotel
module.exports.edit = async (req, res) => {
  const { model_hotel, thumbnail, description } = req.body;
  const { id_model_hotel } = req.params;
  if (!model_hotel || model_hotel === "") {
    return res.json({
      status: 400,
      message: "Hãy điền thông tin loại hình khách sạn!",
    });
  }

  if (!thumbnail || thumbnail === "") {
    return res.json({
      status: 400,
      message: "Hãy thêm thông tin hình ảnh khách sạn!",
    });
  }

  if (!description || description === "") {
    return res.json({
      status: 400,
      message: "Hãy điền mô tả thông tin loại hình khách sạn!",
    });
  }

  if (!id_model_hotel) {
    return res.json({
      status: 400,
      message: "Không tìm thấy id loại hình khách sạn",
    });
  }

  const editModelHotel = await ModelHotel.findOneAndUpdate(
    {
      _id: id_model_hotel,
    },
    req.body,
  );
  res.json({
    status: 200,
    message: "Cập nhật loại hình khách sạn thành công!",
  });
};
