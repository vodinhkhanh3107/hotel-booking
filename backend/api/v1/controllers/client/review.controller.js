const Review = require("../../model/review.model");
const Order = require("../../model/order-room.model");
const Hotel = require("../../model/hotel.model");
const User = require("../../model/user.model");

// [GET] /api/v1/management-hotel/review/hotel/:id_hotel
module.exports.getReviewOfHotel = async (req,res) => {
    const { id_hotel } = req.params;

    const hotelOfReview = await Review.find({
        id_hotel
    }).select("-id_order -id_room");

    for(let i=0;i<hotelOfReview.length;i++){
        const userOfReview = await User.findOne({
            _id: hotelOfReview[i].id_user
        });
        if(userOfReview){
            hotelOfReview[i] = hotelOfReview[i].toObject();
            hotelOfReview[i].avartar = userOfReview.avartar;
            hotelOfReview[i].full_name = userOfReview.full_name;
            hotelOfReview[i].email = userOfReview.email;
        }
    }
    res.json({
        reviews: hotelOfReview,
        status: 200,
        message: "Lấy danh sách đánh giá thành công!"
    });
}

module.exports.create = async(req,res) => {
    const { id_order, id_user, id_hotel, id_room, rating, comment} = req.body;

    if(!id_order){
        return res.json({
            status: 400,
            message: "Không có đơn hàng trong hệ thống!"
        })
    };
    if(!id_user){
        return res.json({
            status: 400,
            message: "Không tìm thấy người dùng trong hệ thống!"
        })
    };
    if(!id_hotel){
        return res.json({
            status: 400,
            message: "Không tìm thấy khách sạn trong hệ thống!"
        })
    };
    if(!id_room){
        return res.json({
            status: 400,
            message: "Không tìm thấy phòng trong hệ thống!"
        })
    };
    if(!rating){
        return res.json({
            status: 400,
            message: "Hãy đánh giá số sao cho khách sạn này!"
        })
    };
    
    const newReview = new Review({
        id_order,
        id_user, 
        id_hotel,
        id_room, 
        rating, 
        comment: comment ? comment : ""
    });

    await newReview.save();

    // cập nhật lại số sao cho khách sạn
    const hotelByreview = await Review.find({
        id_hotel
    }).select("id_hotel rating");


    const countRatingOfHotel = await Review.find({
        id_hotel
    }).countDocuments();

    const totalRating = hotelByreview.reduce((total,review) => Number(review.rating) + total,0);
    const averageRating = totalRating / countRatingOfHotel;

    await Hotel.updateOne({
        _id: id_hotel
    },{
        $set: { star_level: averageRating }
    });
    // cập nhật lại số sao cho khách sạn


    res.json({
        status: 201,
        message: "Gửi đánh giá thành công!"
    })
}