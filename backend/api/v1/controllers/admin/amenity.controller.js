const Amenity = require("../../model/amenity.model");


module.exports.index = async(req,res) => {
    const amenities = await Amenity.find();
    if(!amenities || amenities.length === 0){
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

module.exports.create = async(req,res) => {
    const {name_amenity,status} = req.body;
    if(!name_amenity || name_amenity === ""){
        return res.json({
            status: 400,
            message: "Hãy điền tên cho tiện nghi"
        })
    };

    const existingAmenity = await Amenity.findOne({
        name_amenity: name_amenity.trim()
    });

    if(existingAmenity){
        return res.json({
            status: 400,
            message: "Tiện nghi này đã tồn tại"
        })
    }
    const totalAmenity = await Amenity.countDocuments();
    
    const newAmenity = new Amenity({
        code_amentity: Number(totalAmenity) + 1,
        name_amenity,
        status: status ? "active" : "block"
    });
    await newAmenity.save();

    res.json({
        status: 201,
        message: "Tạo mới tiện nghi thành công!"
    });
}

module.exports.update = async(req,res) => {
    const { id_amenity } = req.params;
    const { name_amenity, status } = req.body;

    if(!name_amenity || name_amenity === ""){
        return res.json({
            status: 400,
            message: "Hãy điền tên cho tiện nghi"
        })
    };

    const existingAmenity = await Amenity.findOne({
        _id: { $ne: id_amenity },
        name_amenity: name_amenity.trim()
    });

    if(existingAmenity){
        return res.json({
            status: 400,
            message: "Tiện nghi này đã tồn tại"
        })
    }
    
    await Amenity.findOneAndUpdate({
        _id: id_amenity
    },{
        $set: { name_amenity, status }
    });

    res.json({
        status: 201,
        message: "Cập nhật tiện nghi thành công!"
    });
}

module.exports.changeStatus = async(req,res) => {
    const { id_amenity } = req.params;
    const { status } = req.body;


    const existingAmenity = await Amenity.findOne({
        _id: id_amenity.trim()
    });

    if(!existingAmenity){
        return res.json({
            status: 400,
            message: "Tiện nghi không có trong hệ thống!"
        })
    }
    
    await Amenity.findOneAndUpdate({
        _id: id_amenity
    },{
        $set: { status }
    });

    res.json({
        status: 201,
        message: "Cập nhật trạng thái tiện nghi thành công!"
    });
}