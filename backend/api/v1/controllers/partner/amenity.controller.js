const Amenity = require("../../model/amenity.model");


// [GET] /api/v1/management-hotel/amenity
module.exports.index = async(req,res) => {
    const { status } = req.query;
    let amenities = [];
    if(!status){
        amenities = await Amenity.find();
    }

    else{
        amenities = await Amenity.find({
            status
        });
    }
    if(!amenities){
        return res.json({
            status: 400,
            message: "Danh sách tiện nghi trống!"
        });
        
    } 
    res.json({
        status: 200,
        amenities,
        message: "Lấy ra danh sách tiện nghi thành công!"
    })
}
