const ModelHotel = require("../../model/model-hotel.model");

// [GET] /api/v1/management-hotel/partner/model-hotel
module.exports.index = async (req,res) => {
    const modelHotels = await ModelHotel.find();
    if(!modelHotels){
        return res.json({
            status: 400,
            message: "Lỗi khi lấy loại hình khách sạn!"
        })
    }
    res.json({
        modelHotels,
        status: 200,
        message: "Lấy danh sách loại hình khách sạn thành công!"
    })
}
