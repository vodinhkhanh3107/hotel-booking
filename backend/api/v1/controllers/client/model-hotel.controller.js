const Hotel = require("../../model/hotel.model");
const ModelHotel = require("../../model/model-hotel.model")
const normalizeHelper = require("../../../../helpers/client/normalize-keyword");
const { getMinPrice } = require("../../../../helpers/client/hotel");

module.exports.index = async (req,res) => {
    const modelHotel = await ModelHotel.find();

    if(!modelHotel){
        return res.json({
            status: 400,
            message: "Danh sách loại hình khách sạn trống!"
        });
    };

    return res.json({
        status: 200,
        modelHotel,
        message: "Lấy ra danh sách loại hình khách sạn thành công!"
    })
}

module.exports.getHotelByModel = async (req,res) => {
    const { slug } = req.query;

    const slugNormalize = normalizeHelper.normalizeKeyWord(slug)
    .split(" ")
    .join("-");
    const modelHotel = await ModelHotel.findOne({
        slug: {
            $regex: slugNormalize,
            $options: "i",
        },
    });
    
    let hotelByModelHotel = await Hotel.find({
        status: "APPROVED",
        blocked: false,
        id_model_hotel: modelHotel.id
    });

    if(!hotelByModelHotel){
        return res.json({
            status: 400,
            message: "Lỗi khi lấy danh sách khách sạn theo mô hình khách sạn!"
        });
    }

    for(let i=0;i<hotelByModelHotel.length;i++){
        hotelByModelHotel[i] = await getMinPrice(hotelByModelHotel[i]);
    }

    res.json({
        status: 200,
        hotelByModelHotel,
        message: "Lấy danh sách khách sạn theo mô hình khách sạn thành công!"
    })
}