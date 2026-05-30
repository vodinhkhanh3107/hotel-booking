const Order = require("../../model/order-room.model");
const orderHelper = require("../../../../helpers/partner/order");
const Hotel = require("../../model/hotel.model");

module.exports.index = async (req, res) => {
  const { id_partner, status, check_in_date, check_out_date } = req.query;
  const hotelOfPartner = await Hotel.find({
    id_partner,
  });

  let idHotel = [];
  if (hotelOfPartner) {
    idHotel = hotelOfPartner.map((hotel) => hotel._id);
  }

  switch (status) {
    case "APPROVED":
      let orderApproveds = [];
      if (check_in_date && check_out_date) {
        orderApproveds = await Order.find({
          id_hotel: { $in: idHotel },
          status: "APPROVED",
          check_in_date: { $gte: check_in_date },
          check_out_date: { $lte: check_out_date },
        });
        if (!orderApproveds) {
          return res.json({
            status: 400,
            message: "Không có đơn hàng nào!",
          });
        }
      } else {
        orderApproveds = await Order.find({
          id_hotel: { $in: idHotel },
          status: "APPROVED",
        });
      }
      if (!orderApproveds) {
        return res.json({
          status: 400,
          message: "Không có đơn hàng nào!",
        });
      }
      const allApprovedOrders = await orderHelper.getOrder(orderApproveds);
      return res.json({
        orders: allApprovedOrders,
        status: 200,
        message: "Lấy danh sách đơn hàng thành công!",
      });
      return;
    case "PENDING":
      let orderPendings = [];
      if (check_in_date && check_out_date) {
        orderPendings = await Order.find({
          id_hotel: { $in: idHotel },
          status: "PENDING",
          check_in_date: { $gte: check_in_date },
          check_out_date: { $lte: check_out_date },
        });
        if (!orderPendings) {
          return res.json({
            status: 400,
            message: "Không có đơn hàng nào!",
          });
        }
      } else {
        orderPendings = await Order.find({
          id_hotel: { $in: idHotel },
          status: "PENDING",
        });
      }
      if (!orderPendings) {
        return res.json({
          status: 400,
          message: "Không có đơn hàng nào!",
        });
      }
      const allPendingOrders = await orderHelper.getOrder(orderPendings);
      return res.json({
        orders: allPendingOrders,
        status: 200,
        message: "Lấy danh sách đơn hàng thành công!",
      });
      return;
    case "REJECTED":
      let orderRejecteds = [];
      if (check_in_date && check_out_date) {
        orderRejecteds = await Order.find({
          id_hotel: { $in: idHotel },
          status: "REJECTED",
          check_in_date: { $gte: check_in_date },
          check_out_date: { $lte: check_out_date },
        });
        if (!orderRejecteds) {
          return res.json({
            status: 400,
            message: "Không có đơn hàng nào!",
          });
        }
      } else {
        orderRejecteds = await Order.find({
          id_hotel: { $in: idHotel },
          status: "REJECTED",
        });
        if (!orderRejecteds) {
          return res.json({
            status: 400,
            message: "Không có đơn hàng nào!",
          });
        }
      }
      const allRejectedOrders = await orderHelper.getOrder(orderRejecteds);
      return res.json({
        orders: allRejectedOrders,
        status: 200,
        message: "Lấy danh sách đơn hàng thành công!",
      });
      return;
    default:
      let orders = [];
      if (check_in_date && check_out_date) {
        orders = await Order.find({
          id_hotel: { $in: idHotel },
          check_in_date: { $gte: check_in_date },
          check_out_date: { $lte: check_out_date },
        });
        if (!orders) {
          return res.json({
            status: 400,
            message: "Không có đơn hàng nào!",
          });
        }
      } else {
        orders = await Order.find({
          id_hotel: { $in: idHotel },
        });
        if (!orders) {
          return res.json({
            status: 400,
            message: "Không có đơn hàng nào!",
          });
        }
      }
      const allOrders = await orderHelper.getOrder(orders);
      return res.json({
        orders: allOrders,
        status: 200,
        message: "Lấy danh sách đơn hàng thành công!",
      });
  }
};

// module.exports.type = async (req, res) => {
//   const { type } = req.query;
//   const orders = await Order.find({
//     status: type,
//   });
//   if (!orders) {
//     return res.json({
//       status: 400,
//       message: "Không có đơn hàng nào!",
//     });
//   }

//   res.json({
//     status: 200,
//     message: "Lấy ra danh sách đơn hàng theo phân loại thành công!",
//   });
// };
