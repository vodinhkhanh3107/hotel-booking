const cron = require("node-cron");

const Promotion = require("../api/v1/model/promotion.model");
const Room = require("../api/v1/model/rooms.model");
const Order = require("../api/v1/model/order-room.model");

module.exports.cronPromotion = async () => {
  try{
    cron.schedule("*/10 * * * *", async () => {
      await Promotion.updateMany(
        {
          end_date: { $lte: new Date() },
        },
        {
          $set: { status: "expired" },
        },
      );
    });

  }
  catch(error){
    throw new Error({
      message: "Lỗi khi dùng code-cron",
      error
    })
  }
};

module.exports.cronRoom = async () => {
  try{
    cron.schedule("*/10 * * * *", async () => {
      // lấy ra danh sách đơn đặt phòng đã được duyệt nhưng ngày ra đã nhỏ hơn ngày hiện tại
      const orderApprovedExpired = await Order.find({
        status: "APPROVED",
        check_out_date: { $lte: new Date() }
      }).select("status check_out_date");
      if(orderApprovedExpired){

        const orderApprovedExpiredId = orderApprovedExpired.map(item => item._id);
        await Order.updateMany({
          _id: { $in: orderApprovedExpiredId }
        },{
          $set: { status: "COMPLETED" }
        })
      }
      // lấy ra danh sách đơn đặt phòng đã được duyệt nhưng ngày ra đã nhỏ hơn ngày hiện tại

      // lấy ra danh sách đơn đặt phòng chưa được duyệt nhưng ngày ra đã nhỏ hơn ngày hiện tại
      const orderPendingExpired = await Order.find({
        status: "PENDING",
        check_out_date: { $lte: new Date() }
      }).select("status check_out_date");
      // console.log(orderPendingExpired);
      if(orderPendingExpired){

        const orderPendingExpiredId = orderPendingExpired.map(item => item._id);
        await Order.updateMany({
          _id: { $in: orderPendingExpiredId }
        },{
          $set: { status: "CANCELLED" }
        })
      }
      // lấy ra danh sách đơn đặt phòng chưa được duyệt nhưng ngày ra đã nhỏ hơn ngày hiện tại

      // lấy ra danh sách phòng đã đén ngày ra và cập nhật lại trạng thái phòng trống cho nó
      const ordeExpired = await Order.find({
        check_out_date: { $lte: new Date() }
      }).select("id_room check_out_date");
      if(ordeExpired){
        const IdRooms = ordeExpired.map(item => item.id_room);
        await Room.updateMany({
          _id: { $in: IdRooms }
        },{
          
          $set: { status: "inactive" }
        });
      }
    });

  }
  catch(error){
    throw new Error({
      message: "Lỗi khi dùng code-cron",
      error
    })
  }
};
