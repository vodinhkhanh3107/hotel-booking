import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  Tag,
  Modal,
  App as AntApp,
  DatePicker,
  Avatar,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  PercentageOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../services/axiosClient";
import dayjs from "dayjs";

// IMPORT MOCK DATA
import { MOCK_DISCOUNTS } from "../../constants/mockData.jsx";
import { useCookies } from "react-cookie";
import {
  AccountApiClient,
  OrderApiClient,
  RoomApiClient,
} from "../../services/apiClient.jsx";

import avartar from "../../../public/avartar.jpg";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Checkout = () => {
  const [cookies, _] = useCookies();
  const [user, setUser] = useState({});
  const [room, setRoom] = useState({});
  const [promotions, setPromotion] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { message: antdMessage } = AntApp.useApp();

  const { hotel } = location.state || {};
  const [dates, setDates] = useState([
    dayjs().startOf("day"),
    dayjs().add(1, "day").startOf("day"),
  ]);
  const [loading, setLoading] = useState(false);

  const [selectedDiscount, setSelectedDiscount] = useState({
    code: null,
    discount_percent: null,
    id: null,
  });
  useEffect(() => {
    const user = cookies.user;
    const id_room = location.pathname.split("/")[2];

    if (!user) {
      antdMessage?.warning("Vui lòng đăng nhập để tiếp tục đặt phòng!");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!id_room) {
      antdMessage?.error("Thông tin phòng không hợp lệ!");
      navigate("/hotels");
      return;
    }

    if (!hotel) {
      antdMessage?.error("Thông tin khách sạn không hợp lệ!");
      navigate("/hotels");
      return;
    }

    const fetchApiUser = async () => {
      const res = await AccountApiClient.myAccount(user.id);
      if (res.status === 200) {
        setUser(res.account);
      }
    };
    fetchApiUser();

    const fetchApiRoom = async () => {
      const res = await RoomApiClient.getDetailRoom(id_room);
      console.log(res);
      if (res.status === 200) {
        console.log(res);
        setRoom(res.room);
        setPromotion(res.promotions);
      }
    };

    fetchApiRoom();
  }, [cookies.user, navigate, hotel, antdMessage, location.pathname]);

  const billingDetails = useMemo(() => {
    let nights = 0;
    if (dates && dates[0] && dates[1]) {
      nights = dates[1].startOf("day").diff(dates[0].startOf("day"), "day");
    }
    const actualNights = nights > 0 ? nights : 0;
    const subTotal = (room?.price || 0) * actualNights;

    let discountAmount = 0;
    if (selectedDiscount) {
      discountAmount =
        (subTotal * (selectedDiscount.discount_percent || 0)) / 100;
    }

    const totalBeforeTax = Math.max(0, subTotal - discountAmount);
    const tax = totalBeforeTax * 0.05;
    const total = totalBeforeTax + tax;

    return { nights: actualNights, subTotal, discountAmount, tax, total };
  }, [dates, room, selectedDiscount]);
  // KHÔI PHỤC LOGIC XÁC NHẬN ĐẶT PHÒNG
  const handleConfirm = async () => {
    if (billingDetails.nights <= 0) {
      return antdMessage?.error("Vui lòng chọn thời gian lưu trú hợp lệ!");
    }

    setLoading(true);
    const newBooking = {
      id_user: user._id,
      id_room: room._id,
      id_hotel: hotel._id,
      check_in_date: dates[0].format("YYYY-MM-DD"),
      check_out_date: dates[1].format("YYYY-MM-DD"),
      total_amount: billingDetails.total,
      id_promotion: selectedDiscount.id,
      nights: billingDetails.nights,
      sub_total: billingDetails.subTotal,
      tax: billingDetails.tax,
    };

    try {
      const res = await OrderApiClient.createBooking(newBooking);
      console.log(res);
      if (res.status >= 400) {
        antdMessage.error(res.message);
        return;
      }
      navigate("/checkout/success", {
        state: {
          code_order: res.newCodeOrder
        },
      });
      antdMessage.success(res.message);
      setLoading(true);
    } catch (error) {
      antdMessage.error("Lỗi kết nối với hệ thống");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div style={{ width: "100%", paddingBottom: 40 }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, color: "#64748b" }}
      >
        Quay lại
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={15}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              variant={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Title level={4}>
                <SafetyCertificateOutlined style={{ color: "#52c41a" }} /> Thông
                tin khách hàng
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 16,
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Avatar
                  size={64}
                  alt={user?.avartar}
                  src={user.avartar ? user.avartar : avartar}
                  style={{ backgroundColor: "#3b82f6" }}
                  icon={<UserOutlined />}
                >
                  {user?.full_name?.charAt(0)}
                </Avatar>
                <div style={{ marginLeft: 20 }}>
                  <Text strong style={{ fontSize: 18, display: "block" }}>
                    {user?.full_name}
                  </Text>
                  <Text type="secondary">{user?.email}</Text>
                </div>
              </div>
            </Card>

            <Card
              variant={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Title level={4} style={{ marginBottom: 20 }}>
                <CalendarOutlined /> Thời gian lưu trú
              </Title>
              <RangePicker
                style={{ width: "100%", height: 55, borderRadius: 12 }}
                value={dates}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                onChange={(val) => setDates(val)}
                format="DD/MM/YYYY"
                allowClear={false}
              />
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            variant={false}
            style={{
              borderRadius: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              position: "sticky",
              top: 80,
            }}
          >
            <div
              style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16 }}
            >
              <img
                alt="room"
                src={room.thumbnail}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Tag color="blue">{hotel?.hotel_name}</Tag>
                <Title level={4} style={{ margin: "4px 0 0 0" }}>
                  Phòng {room.number_room}
                </Title>
                <Text type="secondary">
                  {room.type_room} - {Number(room.price).toLocaleString()}₫/đêm
                </Text>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              {/* MÃ GIẢM GIÁ */}
              <div>
                <Text strong>
                  <PercentageOutlined /> Mã giảm giá của khách sạn
                </Text>
                <Select
                  placeholder="Chọn mã giảm giá"
                  style={{ width: "100%", marginTop: 8 }}
                  allowClear
                  onChange={(_, option) => {
                    setSelectedDiscount({
                      code: option.key,
                      discount_percent: option.value,
                      id: option.label,
                    });
                  }}
                >
                  {promotions.length >= 1 && promotions.map((promotion) => (
                    <Select.Option
                      key={promotion.code}
                      label={promotion._id}
                      value={promotion.discount_percent}
                    >
                      <span style={{ fontWeight: "bold", color: "#f5222d" }}>
                        {promotion.code}
                        - Giảm {promotion.discount_percent}%
                      </span>{" "}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>
                  Tiền phòng ({room?.price?.toLocaleString()} /{" "}
                  {billingDetails.nights} đêm)
                </Text>
                <Text strong>{room?.price?.toLocaleString()}₫</Text>
              </div>

              {selectedDiscount && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text type="danger">
                    Khuyến mãi ({selectedDiscount.code})
                  </Text>
                  <Text type="danger">
                    - {billingDetails.discountAmount.toLocaleString()}₫
                  </Text>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Thuế & Phí (5%)</Text>
                <Text>{billingDetails.tax.toLocaleString()}₫</Text>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Tổng cộng
                </Title>
                <Title level={3} style={{ color: "#e11d48", margin: 0 }}>
                  {billingDetails.total.toLocaleString()}₫
                </Title>
              </div>

              <Button
                type="primary"
                block
                size="large"
                loading={loading}
                onClick={handleConfirm}
                style={{
                  marginTop: 16,
                  height: 50,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  background: "#10b981",
                  border: "none",
                }}
              >
                XÁC NHẬN ĐẶT PHÒNG
              </Button>
              <Text
                type="secondary"
                style={{ textAlign: "center", display: "block", fontSize: 12 }}
              >
                <InfoCircleOutlined /> Đơn hàng sẽ được xác nhận ngay lập tức.
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
