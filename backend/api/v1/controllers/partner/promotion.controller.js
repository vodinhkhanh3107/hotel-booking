const Hotel = require("../../model/hotel.model");
const Promotion = require("../../model/promotion.model");

// [GET] /api/v1/management-hotel/promotion
module.exports.index = async (req, res) => {
  const { id_partner, id_hotel } = req.query;

  // Điều kiện query
  const find = {
    id_partner,
  };

  // Nếu có id_hotel thì lọc promotion chứa hotel đó
  if (id_hotel) {
    find.for_hotels = id_hotel;
  }

  console.log(find);
  // Lấy promotions
  let promotions = await Promotion.find(find).lean();

  console.log(promotions);
  if (!promotions) {
    return res.json({
      status: 400,
      message: "Không có mã giảm giá nào!",
    });
  }

  // Lấy tất cả id hotel từ promotions
  const hotelIds = [...new Set(promotions.flatMap((item) => item.for_hotels))];

  // Query toàn bộ hotel 1 lần
  const hotels = await Hotel.find({
    _id: { $in: hotelIds },
  })
    .select("_id hotel_name")
    .lean();

  // Tạo object map nhanh hơn
  const hotelMap = {};

  hotels.forEach((hotel) => {
    hotelMap[hotel._id.toString()] = hotel;
  });

  promotions = promotions.map((promotion) => {
    const hotel_names = promotion.for_hotels
      .map((id) => hotelMap[id.toString()]?.hotel_name)
      .filter(Boolean);

    return {
      ...promotion,
      hotel_names,
    };
  });

  res.json({
    status: 200,
    promotions,
    message: "Lấy danh sách mã giảm giá thành công!",
  });
};

// [POST] /api/v1/management-hotel/promotion/create
module.exports.create = async (req, res) => {
  const {
    id_partner,
    for_hotels,
    code,
    discount_percent,
    start_date,
    end_date,
  } = req.body;

  if (!id_partner) {
    return res.json({
      status: 400,
      message: "Không tìm thấy đối tác trong hệ thống!",
    });
  }

  if (!for_hotels || for_hotels === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn khách sạn cho mã giảm giá!",
    });
  }
  if (!code || code === "") {
    return res.json({
      status: 400,
      message: "Mã code không được để trống!",
    });
  }
  if (!discount_percent || discount_percent === "") {
    return res.json({
      status: 400,
      message: "Phần trăm giảm giá không được để trống!",
    });
  }
  if (!start_date || start_date === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn ngày bắt đầu!",
    });
  }

  if (!end_date || end_date === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn ngày kết thúc!",
    });
  }

  if (new Date(start_date) < new Date()) {
    return res.json({
      status: 400,
      message: "Hãy chọn ngày bắt đầu từ hôm nay trở về sau!",
    });
  }

  if (new Date(end_date) < new Date(start_date)) {
    return res.json({
      status: 400,
      message: "Ngày kết thúc phải sau ngày bắt đầu!",
    });
  }
  const promotions = await Promotion.find({
    status: "available",
  });

  const existPromotion = promotions.find(
    (promotion) => promotion.code === code.trim(),
  );
  if (existPromotion) {
    return res.json({
      status: 400,
      message: "Mã này đã tồn tại!",
    });
  }

  const newPromotion = new Promotion({
    id_partner,
    for_hotels,
    code,
    discount_percent,
    start_date,
    end_date,
  });
  await newPromotion.save();
  res.json({
    status: 201,
    message: "Tạo mới mã giảm giá thành công!",
  });
};

// [POST] /api/v1/management-hotel/promotion/edit/:id_promotion
module.exports.update = async (req, res) => {
  const {
    for_hotels,
    code,
    discount_percent,
    start_date,
    end_date,
  } = req.body;

  const { id_promotion } = req.params;

  if (!for_hotels || for_hotels === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn khách sạn cho mã giảm giá!",
    });
  }
  if (!code || code === "") {
    return res.json({
      status: 400,
      message: "Mã code không được để trống!",
    });
  }
  if (!discount_percent || discount_percent === "") {
    return res.json({
      status: 400,
      message: "Phần trăm giảm giá không được để trống!",
    });
  }
  if (!start_date || start_date === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn ngày bắt đầu!",
    });
  }

  if (!end_date || end_date === "") {
    return res.json({
      status: 400,
      message: "Hãy chọn ngày kết thúc!",
    });
  }

  if (new Date(start_date) < new Date()) {
    return res.json({
      status: 400,
      message: "Hãy chọn ngày bắt đầu từ hôm nay trở về sau!",
    });
  }

  if (new Date(end_date) < new Date(start_date)) {
    return res.json({
      status: 400,
      message: "Ngày kết thúc phải sau ngày bắt đầu!",
    });
  }
  const promotions = await Promotion.find({
    _id: { $ne: id_promotion },
    status: "available",
  });

  const existPromotion = promotions.find(
    (promotion) => promotion.code === code.trim(),
  );
  if (existPromotion) {
    return res.json({
      status: 400,
      message: "Mã này đã tồn tại!",
    });
  }

  await Promotion.findOneAndUpdate({
    _id: id_promotion
  },{
    $set: { ...req.body }
  });
  res.json({
    status: 201,
    message: "Cập nhật mã giảm giá thành công!",
  });
};

// [POST] /api/v1/management-hotel/promotion/change-status/:id_promotion
module.exports.changeStatus = async (req, res) => {
  const { id_promotion } = req.params;
  const { blocked } = req.body;

  
  const promotion = await Promotion.findOne({
    _id: id_promotion,
  });

  if(!promotion){
    return res.json({
      status: 400,
      message: "Mã này không có trong hệ thống"
    });
  };

  await Promotion.findOneAndUpdate({
    _id: id_promotion
  },{
    $set: { blocked: !blocked }
  });
  res.json({
    status: 201,
    message: "Cập nhật trạng thái mã giảm giá thành công!",
  });
};