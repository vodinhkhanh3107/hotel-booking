const Order = require("../../model/order-room.model");
const Hotel = require("../../model/hotel.model");
const RevenueReport = require("../../model/revenue-report.model");

module.exports.index = async (req, res) => {
  const revenueReports = await RevenueReport.find().select("-revenue_partner").sort({
    transaction_date: "desc"
  });
  if (!revenueReports) {
    return res.json({
      status: 400,
      message: "Danh sách báo cáo doanh thu trống!",
    });
  }

  return res.json({
    status: 200,
    revenueReports,
    message: "Lấy ra danh sách báo cáo doanh thu thành công!",
  });
};

module.exports.filter = async (req, res) => {
  const { start, end, id_hotel } = req.query;

  console.log(start, end);
  console.log(typeof id_hotel);

  let revenueReports = [];
  if (start && end && id_hotel) {
    revenueReports = await RevenueReport.find({
      transaction_date: { $gte: start, $lte: end },
      id_hotel,
    }).select("-revenue_partner").sort({
      transaction_date: "desc"
    });
  } else if (start && end) {
    revenueReports = await RevenueReport.find({
      transaction_date: { $gte: start, $lte: end },
    }).select("-revenue_partner").sort({
      transaction_date: "desc"
    });
  } else if (!start && !end && !id_hotel) {
    revenueReports = await RevenueReport.find().select("-revenue_partner").sort({
      transaction_date: "desc"
    });
  } else {
    revenueReports = await RevenueReport.find({
      id_hotel,
    }).select("-revenue_partner").sort({
      transaction_date: "desc"
    });
  }

  return res.json({
    status: 200,
    revenueReports,
    message: "Lọc ra danh sách báo cáo doanh thu thành công!",
  });
};
