const Hotel = require("../../model/hotel.model");
const Partner = require("../../model/partner.model");
const ModelHotel = require("../../model/model-hotel.model");

// [GET] /api/v1/management-hotel/hotel
module.exports.index = async(req,res) => {
    const { status } = req.query;
    let hotels = [];
    console.log(status);
    if(!status){
        hotels = await Hotel.find().sort({
            createdAt: "desc"
        });
    }

    else{
        hotels = await Hotel.find({
            status
        });
    }

    if(!hotels){
        return res.json({
            status: 400,
            message: "Danh sách phê duyệt khách sạn trống!"
        });
        
    };
    console.log(hotels)

    for(let i=0;i<hotels.length;i++){
        // lấy tên đối tác của khách sạn
        hotels[i] = hotels[i].toObject();
        const partnerOfHotel = await Partner.findOne({
            _id: hotels[i].id_partner
        });

        hotels[i].name_parner = partnerOfHotel.full_name;

        // lấy tên loại hình của khách sạn
        const modelOfHotel = await ModelHotel.findOne({
            _id: hotels[i].id_model_hotel
        });

        if(modelOfHotel){
            hotels[i].model_hotel = modelOfHotel.model_hotel;
        }
    };
    
    res.json({
        status: 200,
        hotels,
        message: "Lấy ra danh sách phê duyệt khách sạn thành công!"
    });
}

// [GET] /api/v1/management-hotel/hotel/pending


// [PUT] /api/v1/management-hotel/hotel/operation
module.exports.operation = async(req,res) => {
    const { status } = req.body;
    const { id_hotel } = req.params;

    if(!id_hotel || !status){
        return res.json({
            status: 400,
            message: "Thao tác không thành công do thiếu mã khách sạn hoặc trạng thái!"
        })
    }
    switch(status){
        case "APPROVED":
            await Hotel.findOneAndUpdate({
                _id: id_hotel
            },
            {
                status: "APPROVED"
            }    
            );
            return res.json({
                status: 200,
                message: "Duyệt thành công cho khách sạn!"
            });
        case "REJECTED":
            await Hotel.findOneAndUpdate({
                _id: id_hotel
            },
            {
                status: "REJECTED"
            }    
            );
            return res.json({
                status: 200,
                message: "Từ chối duyệt cho khách sạn này!"
            });
    }
}

