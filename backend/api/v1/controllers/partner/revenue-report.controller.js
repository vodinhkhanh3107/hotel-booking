const RevenueReport = require("../../model/revenue-report.model");


// [GET] /api/v1/management-hotel/partner/revenue-report
module.exports.index = async(req,res) => {
    const revenueReports = await RevenueReport.find().select("-revenue_admin");
    if(!revenueReports || revenueReports.length === 0){
        return res.status(400).json({
            message: "Danh sách báo cáo doanh thu trống!"
        });
    };

    return res.status(200).json({
        revenueReports,
        message: "Lấy ra danh sách báo cáo doanh thu thành công!"
    });
}

// [GET] /api/v1/management-hotel/partner/revenue-report/:id_hotel
module.exports.revenueByHotel = async(req,res) => {
    const { id_hotel } = req.params;
    console.log(id_hotel);
    const revenueByHotel = await RevenueReport.aggregate([
        {
            $match: { id_hotel }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m",
                        date: "$transaction_date",
                    },
                },
                total_amount: { $sum: "$revenue_partner"},
                total_order: { $sum: 1 }
            }
        },
        {
            $limit: 12
        },
        {
            $sort: { _id: -1}
        }
    ]);

    console.log(revenueByHotel);

    res.json({
        status: 200,
        revenueByHotel,
        message: "Lấy danh sách báo cáo doanh thu theo từng tháng thành công!"
    });
}
