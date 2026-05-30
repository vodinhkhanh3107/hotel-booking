import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Tag,
  Table,
  Tabs,
  Image,
  Rate,
  Divider,
  Space,
  Spin,
  Empty,
  Alert,
  App as AntApp,
  List,
  Avatar,
  Tooltip,
} from "antd";
import {
  EnvironmentOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// IMPORT CONTEXT & MOCK DATA
import AuthContext from "../../contexts/AuthContext";
import {
  MOCK_ROOMS,
  MOCK_HOTELS,
  MOCK_BOOKINGS,
  ALL_AMENITIES,
} from "../../constants/mockData.jsx";
import { HotelApiClient, ReviewApiClient } from "../../services/apiClient.jsx";
import { useCookies } from "react-cookie";

const { Title, Text, Paragraph } = Typography;

import avartar from "../../../public/avartar.jpg"

const MOCK_REVIEWS = [
  {
    id: 1,
    hotelId: 1,
    user: "Nguyễn Sơn",
    avatar: "",
    rate: 5,
    date: "20/04/2026",
    comment:
      "Khách sạn tuyệt vời, nhân viên hỗ trợ rất nhiệt tình. Phòng sạch và thoáng!",
  },
  {
    id: 2,
    hotelId: 1,
    user: "Hoàng Anh",
    avatar: "",
    rate: 4,
    date: "15/04/2026",
    comment:
      "Vị trí thuận tiện, gần trung tâm. Đồ ăn sáng ngon nhưng cần đa dạng hơn.",
  },
  {
    id: 3,
    hotelId: 2,
    user: "Minh Thu",
    avatar: "",
    rate: 5,
    date: "10/04/2026",
    comment: "Giá cả hợp lý, chất lượng dịch vụ 5 sao. Sẽ quay lại!",
  },
];

const HotelDetail = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [cookies, _] = useCookies();
  const [hotelDetail, setHotelDetail] = useState({});
  const [roomDetail, setRoomDetail] = useState([]);

  console.log(cookies.user)
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { message: antdMessage, modal } = AntApp.useApp();

  const [reviews, setReviews] = useState("");
  const [loading, setLoading] = useState(true);

  const roomTableRef = useRef(null);

  const scrollToRooms = () => {
    roomTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
          console.log(hotelDetail);

  useEffect(() => {
    const fetchApiHotel = async () => {
      if (id) {
        const res = await HotelApiClient.getDetailHotel(id);
        console.log(res);
        if (res.status === 200) {
          setHotelDetail(res.detailHotel);
          setRoomDetail(res.listRoomOfHotel);
          // setReviews(res.reviewsOfHotel);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      }
    };
    const fetchApiReview = async () => {
      if (id) {
        const res = await ReviewApiClient.getReview(id);
        console.log(res);
        if (res.status === 200) {
          setReviews(res.reviews);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      }
    };
    try {
      switch (activeTab) {
        case "1":
          fetchApiHotel();
          return;
        case "2":
          fetchApiReview();
          return;
      }
    } catch (error) {
      antdMessage.error("Lỗi kết nối với hệ thống");
    } finally {
      setLoading(false);
    }
    window.scrollTo(0, 0);
  }, [id, antdMessage, activeTab]);

  const handleChat = () => {
    if (!user) {
      modal.confirm({
        title: "Yêu cầu đăng nhập",
        content: "Bạn cần đăng nhập tài khoản để gửi tin nhắn cho khách sạn!",
        onOk: () => navigate("/login", { state: { from: location.pathname } }),
      });
      return;
    }
    navigate("/customer/messages", {
      state: {
        id_hotel: hotel.id_hotel,
        hotel_name: hotel.hotel_name,
        hotel_avatar: hotel.image_url,
      },
    });
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 140,
      align: "center",
      render: (thumbnail) => (
        <Image
          src={thumbnail}
          width={110}
          height={75}
          style={{ borderRadius: 8, objectFit: "cover" }}
          fallback="https://via.placeholder.com/120x80?text=No+Image"
        />
      ),
    },
    {
      title: "Hạng phòng",
      dataIndex: "type_room",
      key: "type_room",
      render: (type_room) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 16 }}>
            {type_room}
          </Text>
          {/* <Text type="secondary" style={{ fontSize: 12 }}>
            Mã phòng: #{record._id}
          </Text> */}
        </Space>
      ),
    },
    {
      title: "Số phòng",
      dataIndex: "number_room",
      key: "number_room",
      render: (number_room) => (
        <Text strong style={{ color: "#1890ff" }}>
          {number_room}
        </Text>
      ),
    },
    {
      title: "Tiện nghi",
      dataIndex: "list_amenity",
      key: "list_amenity",
      width: 200,
      render: (amenities) => (
        <Space size={[0, 4]} wrap>
          {amenities && amenities.map((amenity, index) => {
            return (
              <Tag color="blue" key={index}>
                {amenity}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      width: 100,
      align: "center",
      render: (capacity) => (
        <Space>
          <UserOutlined /> x{capacity}
        </Space>
      ),
    },
    {
      title: "Giá/đêm",
      dataIndex: "price",
      key: "price",
      width: 160,
      align: "right",
      render: (price) => (
        <Text type="danger" strong style={{ fontSize: 19 }}>
          {Number(price).toLocaleString()}₫
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => {
        const isBooked = record.status === "active";
        return (
          <Button
            type={isBooked ? "default" : "primary"}
            block
            disabled={isBooked}
            onClick={() => {
              if (cookies.user) {
                navigate(`/checkout/${record._id}`, {
                  state: { room: record, hotel: hotelDetail },
                });
              } else {
                modal.confirm({
                  title: "Yêu cầu đăng nhập",
                  content: "Vui lòng đăng nhập quyền Khách hàng để đặt phòng!",
                  onOk: () =>
                    navigate("/login", { state: { from: location.pathname } }),
                });
              }
            }}
            style={{ borderRadius: 8, fontWeight: 600, height: 40 }}
          >
            {isBooked ? "Hết phòng" : "ĐẶT NGAY"}
          </Button>
        );
      },
    },
  ];

  // Nội dung cho các Tabs
  const tabItems = [
    {
      label: "Tổng quan",
      key: "1",
      children: (
        <div style={{ marginTop: 20 }}>
          <Title level={4}>Về khách sạn này</Title>
          <Paragraph
            style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.8 }}
          >
            {hotelDetail?.description ||
              "Không gian nghỉ dưỡng lý tưởng với đầy đủ tiện nghi hiện đại."}
            <br />
            <br />
            <EnvironmentOutlined /> <b>Địa chỉ:</b> {hotelDetail?.hotel_address}
          </Paragraph>
        </div>
      ),
    },
    {
      label: reviews ? `Đánh giá (${reviews.length})` : "Đánh giá",
      key: "2",
      children: (
        <div style={{ marginTop: 20 }}>
          <List
            itemLayout="horizontal"
            dataSource={reviews}
            locale={{
              emptyText: <Empty description="Chưa có đánh giá nào." />,
            }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} src={item.avartar || avartar} />}
                  title={
                    <Space size="middle">
                      <Text strong>{item.full_name}</Text>
                      <Rate
                        disabled
                        defaultValue={item.rating}
                        style={{ fontSize: 12 }}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item?.createdAt}
                      </Text>
                    </Space>
                  }
                  description={
                    <Text style={{ color: "#374151" }}>{item.comment}</Text>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ];

  if (!hotelDetail)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Empty description="Khách sạn không tồn tại." />
      </div>
    );

  return loading ? (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  ) : hotelDetail ? (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        padding: "20px",
      }}
    >
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ color: "#64748b", marginBottom: 16, padding: 0 }}
      >
        Quay lại
      </Button>

      {/* HEADER SECTION */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {hotelDetail.hotel_name}
          </Title>
          <Space split={<Divider type="vertical" />}>
            <Rate
              disabled
              value={hotelDetail.star_level}
              style={{ fontSize: 14 }}
            />
            <Text type="secondary">
              <EnvironmentOutlined />{" "}
              {hotelDetail?.hotel_address?.split(", ").at(-1)}
            </Text>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={16}>
          <Image
            src={hotelDetail.thumbnail}
            style={{
              // width: "100%",
              height: 480,
              objectFit: "cover",
              borderRadius: 20,
            }}
            width="80%"
          />
        </Col>
        <Col xs={12} lg={7}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              position: "sticky",
              top: 100,
            }}
          >
            <Text type="secondary">Giá phòng chỉ từ</Text>
            <Title level={3} style={{ color: "#ff4d4f", marginTop: 4 }}>
              {Number(hotelDetail.price).toLocaleString() || 0}₫{" "}
              <small style={{ fontSize: 12, color: "#999" }}>/đêm</small>
            </Title>
            <Alert
              message="Đăng nhập để nhận giá ưu đãi!"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Space direction="horizon" size="middle">
              <Button
                type="primary"
                size="large"
                onClick={scrollToRooms}
                style={{ height: 50, borderRadius: 12 }}
              >
                XEM PHÒNG
              </Button>
              <Button
                icon={<MessageOutlined />}
                size="large"
                onClick={handleChat}
                style={{ height: 50, borderRadius: 12 }}
              >
                NHẮN TIN
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* INFO & BOOKING CARD */}
      <Row gutter={[40, 40]} style={{ marginBottom: 40 }}>
        <Col xs={24} lg={16}>
          <Tabs
            onChange={(key) => setActiveTab(key)}
            defaultActiveKey="1"
            size="large"
            items={tabItems}
          />
        </Col>
      </Row>

      {/* TABLE */}
      <div
        style={{ marginTop: 40, borderTop: "1px solid #eee" }}
        ref={roomTableRef}
      >
        <Title style={{ marginBottom: 30 }} level={3}>
          Danh sách phòng của khách sạn
        </Title>
        <Table
          columns={columns}
          dataSource={roomDetail}
          pagination={false}
          rowKey="_id"
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  ) : (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <Empty description="Khách sạn không tồn tại." />
    </div>
  );
};

export default HotelDetail;
