const RevenueReport = require("../../model/revenue-report.model");
const User = require("../../model/user.model");
const Partner = require("../../model/partner.model");
const Hotel = require("../../model/hotel.model");

module.exports.index = async (req, res) => {
  try {
    // tổng số đơn đặt phòng
    const totalOrders = await RevenueReport.countDocuments();
    // end tổng số đơn đặt phòng

    // lấy ra số đơn của tháng hiện tại va tính tổng doanh thu của tháng đó
    const now = new Date();
    const first_date_of_month = new Date(now.getFullYear(), now.getMonth(), 1);
    const last_date_of_month = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    );

    const revenueOfCurrentMonth = await RevenueReport.aggregate([
      {
        $match: {
          transaction_date: {
            $gte: first_date_of_month,
            $lte: last_date_of_month,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$transaction_date",
            },
          },
          total_amount: { $sum: "$revenue_admin" },
          total_order: { $sum: 1 },
        },
      },
    ]);
    // end lấy ra số đơn của tháng hiện tại va tính tổng doanh thu của tháng đó

    // số khách hàng có trong hệ thống
    const totalUsers = await User.countDocuments();
    // end số khách hàng có trong hệ thống

    // số đối tác đang hoạt động
    const totalPartners = await Partner.countDocuments();
    // end số đối tác đang hoạt động

    const statisticalAdmin = {
      revenueOfCurrentMonth: revenueOfCurrentMonth[0],
      totalOrders,
      totalUsers,
      totalPartners,
    };
    res.json({
      status: 200,
      message: "Thống kê hệ thống thành công!",
      statisticalAdmin,
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports.topHotel = async (req, res) => {
  const { year } = req.query;

  let TopHotelRevenue = await RevenueReport.aggregate([
    {
      $match: {
        transaction_date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: "$id_hotel",
        total_revenue: { $sum: "$revenue_admin" },
        total_order: { $sum: 1 },
      },
    },
    {
      $sort: { total_revenue: -1 },
    },
    {
      $limit: 2
    }
  ]);

  const revenueOfAdmin = await RevenueReport.aggregate([
    {
      $match: { 
        transaction_date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
       }
    },
    {
      $group: {
        _id: "_id",
        totel_revenue: { $sum: "$revenue_admin" },
      }
    }
  ]);

  for (let i = 0; i < TopHotelRevenue.length; i++) {
    const hotelByRevenue = await Hotel.findOne({
      _id: TopHotelRevenue[i]._id,
    });
    
    if(hotelByRevenue){
      TopHotelRevenue[i].hotel_name = hotelByRevenue?.hotel_name;
      TopHotelRevenue[i].occupancy_rate = (TopHotelRevenue[i].total_revenue / revenueOfAdmin[0].totel_revenue).toFixed(2) * 100
    }

  }
  

  res.json({
    status: 200,
    message: "Top 2 khách sạn có doanh thu cao nhất",
    hotels: TopHotelRevenue,
  });
};

module.exports.revenueOfYear = async (req, res) => {
  const { year } = req.query;

  const orderInYears = await RevenueReport.aggregate([
    {
      $match: {
        transaction_date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$transaction_date",
            format: "%Y-%m",
          },
        },
        total_amount: { $sum: "$revenue_admin" },
        total_order: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  const result = orderInYears.map((item, index) => {
    const nextMonth = orderInYears[index + 1];

    let revenue_difference = 0;
    let revenue_growth_percent = 0;

    if (nextMonth) {
      revenue_difference = item.total_amount - nextMonth.total_amount;
      revenue_growth_percent =
        nextMonth === 0
          ? 0
          : ((revenue_difference / nextMonth.total_amount) * 100).toFixed(
              2,
            );
    }

    return {
      month: item._id,
      total_amount: item.total_amount,
      total_order: item.total_order,
      revenue_difference,
      revenue_growth_percent: Number(revenue_growth_percent),
    };
  });

  res.json({
    status: 200,
    orderInYears: result,
    message: "Lấy danh sách đơn theo đợt thành công!",
  });
  // const totalOrderInDay = await RevenueReport.aggregate([
  //   {
  //     $group: {
  //       // lấy theo định dang tùy ý(hay dùng)
  //       _id: {
  //         $dateToString: {
  //           date: "$transaction_date",
  //           format: "%Y-%n",

  //         },
  //       },
  //       total_amount: { $sum: "$revenue_admin" },
  //       total_order: { $sum: 1 }

  //       // lấy theo định dạng ngày tháng năm(ít dùng)
  //       // _id: {
  //       //   $dateTrunc: {
  //       //     date: "$transaction_date",
  //       //     unit: "year"
  //       //   }
  //       // },
  //       // total_amount: { $sum: "$revenue_admin" },
  //       // total_order: { $sum: 1 }
  //     },
  //   },
  // ]);
};
