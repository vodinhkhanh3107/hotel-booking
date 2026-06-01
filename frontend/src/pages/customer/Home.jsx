import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Skeleton,
  Space,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  FireOutlined,
  RightOutlined,
  CompassOutlined,
  AppstoreOutlined,
  PercentageOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import beach from "/assets/beach.jpg";
import { Pagination } from "antd";
// 1. KẾT NỐI DỮ LIỆU
import {
  HotelApiClient,
  ModelHotelApiClient,
} from "../../services/apiClient.jsx";

const { Title, Text } = Typography;

const VIETNAM_PROVINCES = [
  { name: "An Giang", slug: "angiang" },
  { name: "Bắc Ninh", slug: "bacninh" },
  { name: "Cà Mau", slug: "camau" },
  { name: "Cần Thơ", slug: "cantho" },
  { name: "Cao Bằng", slug: "caobang" },
  { name: "Đắk Lắk", slug: "daklak" },
  { name: "Đà Nẵng", slug: "danang" },
  { name: "Điện Biên", slug: "dienbien" },
  { name: "Đồng Nai", slug: "dongnai" },
  { name: "Đồng Tháp", slug: "dongthap" },
  { name: "Gia Lai", slug: "gialai" },
  { name: "Hải Phòng", slug: "haiphong" },
  { name: "Hà Nội", slug: "hanoi" },
  { name: "Hà Tĩnh", slug: "hatinh" },
  { name: "TP. Hồ Chí Minh", slug: "hcm" },
  { name: "Huế", slug: "hue" },
  { name: "Hưng Yên", slug: "hungyen" },
  { name: "Khánh Hòa", slug: "khanhhoa" },
  { name: "Lai Châu", slug: "laichau" },
  { name: "Lâm Đồng", slug: "lamdong" },
  { name: "Lạng Sơn", slug: "langson" },
  { name: "Lào Cai", slug: "laocai" },
  { name: "Nghệ An", slug: "nghean" },
  { name: "Ninh Bình", slug: "ninhbinh" },
  { name: "Phú Thọ", slug: "phutho" },
  { name: "Quảng Ninh", slug: "quangninh" },
  { name: "Quảng Ngãi", slug: "quangngai" },
  { name: "Quảng Trị", slug: "quangtri" },
  { name: "Sơn La", slug: "sonla" },
  { name: "Tây Ninh", slug: "tayninh" },
  { name: "Tuyên Quang", slug: "tuyenquang" },
  { name: "Thái Nguyên", slug: "thainguyen" },
  { name: "Thanh Hóa", slug: "thanhhoa" },
  { name: "Vĩnh Long", slug: "vinhlong" },
];

const Home = () => {
  const [allCity,setAllCity] = useState([]);
  const refModelHotel = useRef("");
  const refCity = useRef("");
  const navigate = useNavigate();
  const [modelHotel, setModelHotel] = useState([]);
  const [query, setQuery] = useState("");
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [discountHotels, setDiscountHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // api lấy ra loại hình khách sạn
  useEffect(() => {
    const fetchApiModelHotel = async () => {
      const res = await ModelHotelApiClient.getAllModelHotel();
      if (res.status === 200) {
        setModelHotel(res.modelHotel);
      }
    };

    fetchApiModelHotel();
  }, []);

  // api lấy 4 khách sạn đề xuất
  useEffect(() => {
    const fetchApi = async () => {
      const res = await HotelApiClient.getAllHotel();
      if (res.status === 200) {
        setFeaturedHotels(res.hotels.slice(0, 4));
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchApi();
  }, []);

  // api lấy 4 khách sạn có mã giảm giá nhiều nhất
  useEffect(() => {
    const fetchApi = async () => {
      const res = await HotelApiClient.getDiscountHotel();
      if (res.status === 200) {
        setDiscountHotels(res.hotels.slice(0, 4));
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchApi();
  }, []);

  // lấy ra các tỉnh thành việt nam
  
  useEffect(() => {
    const cityCount = {};
    const sDests = VIETNAM_PROVINCES.map((p) => ({
      city: p.name,
      img: `/assets/${p.slug}.jpg`,
      realCount: cityCount[p.name] || 0,
    })).sort((a, b) => b.realCount - a.realCount);
    const fetchData = async () => {
      setTimeout(() => {
        setAllCity(sDests);
        setLoading(false);
      }, 1000);
    };
    fetchData();
  }, []);

  const currentCities = allCity.slice(
    (currentPage - 1) * 12,
    currentPage * 12
  );

  const handleSetQuery = (city) => {
    refCity.current = city;
    setTimeout(() => {
      handleNavigate("location");
    }, 1000);
  };

  // --- CẬP NHẬT ĐIỀU HƯỚNG SANG CỤM /CUSTOMER ---
  const handleNavigate = async (filters) => {
    const params = new URLSearchParams();
    switch (filters) {
      case "search_location":
        params.set("search_location", query);
        navigate(`/hotels?${params.toString()}`, { state: "search_location" });
        return;
      case "location":
        params.set("location", refCity.current);
        navigate(`/hotels?${params.toString()}`, { state: "location" });
        return;
      case "model-hotel":
        console.log(query);
        params.set("model_hotel", refModelHotel.current);
        navigate(`/hotels?${params.toString()}`, { state: "model_hotel" });
        return;
      default:
        return;
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* 1. HERO SECTION */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url(${beach}) no-repeat center/cover`,
          padding: "10px 10px",
          textAlign: "center",
          color: "#fff",
          borderRadius: "0 0 20px 20px",
          marginBottom: "40px",
        }}
      >
        <Title
          style={{
            color: "#fff",
            fontSize: "clamp(32px, 5vw, 36px)",
            fontWeight: 700,
            marginBottom: "0px",
          }}
        >
          Tận hưởng kỳ nghỉ tuyệt vời
        </Title>
        <Text
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "18px",
            display: "block",
            marginBottom: "20px",
          }}
        >
          Với hàng nghìn khách sạn chờ đón
        </Text>

        <Card
          variant={false}
          styles={{ body: { padding: "12px 20px" } }}
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={18}>
              <Input
                size="large"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={() => handleNavigate("search_location")}
                placeholder="Bạn muốn nghỉ dưỡng ở đâu?"
                prefix={<EnvironmentOutlined style={{ color: "#1890ff" }} />}
                style={{ borderRadius: "8px", height: "45px" }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Button
                size="large"
                type="primary"
                block
                icon={<SearchOutlined />}
                onClick={() => handleNavigate("location")}
                style={{
                  borderRadius: "8px",
                  height: "45px",
                  fontWeight: "bold",
                }}
              >
                TÌM KIẾM
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* 2. TÌM THEO LOẠI CHỖ NGHỈ */}
        <div style={{ marginBottom: "50px" }}>
          <Title level={3} style={{ marginBottom: "20px" }}>
            <AppstoreOutlined style={{ color: "#1890ff" }} /> Tìm theo loại chỗ
            nghỉ
          </Title>
          <Row gutter={[16, 16]}>
            {modelHotel.map((item, index) => (
              <Col xs={12} sm={6} key={index}>
                <div
                  style={{ cursor: "pointer" }}
                  className="hover-scale-card"
                  onClick={() => {
                    refModelHotel.current = item.model_hotel;
                    handleNavigate("model-hotel");
                  }}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      height: "150px",
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.model_hotel}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      className="zoom-img"
                    />
                  </div>
                  <Text strong style={{ fontSize: "16px" }}>
                    {item.model_hotel}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* 3. KHÁM PHÁ VIỆT NAM */}
        <div style={{ marginBottom: "60px" }}>
          <Title level={3} style={{ margin: "0 0 4px 0" }}>
            <CompassOutlined style={{ color: "#fa8c16" }} /> Khám phá Việt Nam
          </Title>

          <Row gutter={[16, 16]}>
            {currentCities.map((dest, index) => (
              <Col xs={12} sm={8} md={4} key={index}>
                <div
                  style={{ cursor: "pointer" }}
                  className="hover-scale-card"
                  onClick={() => handleSetQuery(dest.city)}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      height: "120px",
                    }}
                  >
                    <img
                      src={dest.img}
                      alt={dest.city}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      className="zoom-img"
                    />
                  </div>

                  <Text strong style={{ display: "block", fontSize: "15px" }}>
                    {dest.city}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <Pagination
              current={currentPage}
              total={34}
              onChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </div>
        </div>

        {/* 4. ƯU ĐÃI LỚN NHẤT (HOT DEALS) */}
        <div style={{ marginBottom: "60px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <PercentageOutlined
              style={{ fontSize: "24px", color: "#ff4d4f" }}
            />
            <Title level={3} style={{ margin: 0 }}>
              Ưu đãi cực hời
            </Title>
          </div>
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: "20px" }}
          >
            Mã giảm giá siêu hấp dẫn
          </Text>
          <Row gutter={[20, 20]}>
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <Col xs={12} md={6} key={i}>
                    <Skeleton active />
                  </Col>
                ))
              : discountHotels.map((hotel) => (
                  <Col xs={12} md={6} key={hotel._id}>
                    <Card
                      hoverable
                      styles={{ body: { padding: "12px" } }}
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                      cover={
                        <div
                          style={{
                            position: "relative",
                            height: "180px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={hotel.thumbnail}
                            alt={hotel.hotel_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />

                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              background: "#ff4d4f",
                              color: "#fff",
                              padding: "4px 12px",
                              fontWeight: "bold",
                              borderBottomLeftRadius: "12px",
                            }}
                          >
                            -{hotel?.discount_percent}%
                          </div>
                        </div>
                      }
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #ffccc7",
                      }}
                    >
                      <Text strong ellipsis style={{ display: "block" }}>
                        {hotel.hotel_name}
                      </Text>
                      <Space size={4} style={{ marginBottom: 8 }}>
                        <StarOutlined style={{ color: "#fadb14" }} />
                        <Text type="secondary">
                          {hotel.star_level} | <EnvironmentOutlined />{" "}
                          {hotel.hotel_address.split(", ").at(-1)}
                        </Text>
                      </Space>
                      <Space
                        orientation="horizontal"
                        align="center"
                        style={{ marginTop: "8px", display: "block" }}
                      >
                        <Text
                          delete
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          {(
                            hotel?.price * hotel?.discount_percent
                          ).toLocaleString()}
                          ₫
                        </Text>
                        <Text type="danger" strong style={{ fontSize: "16px" }}>
                          {hotel?.price.toLocaleString()}₫
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
          </Row>
        </div>

        {/* 5. GỢI Ý CHO BẠN */}
        <div style={{ paddingBottom: "80px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              <FireOutlined style={{ color: "#ff4d4f" }} /> Gợi ý cho bạn
            </Title>
            <Button type="link" onClick={() => navigate("/hotels")}>
              Xem tất cả <RightOutlined style={{ fontSize: 12 }} />
            </Button>
          </div>
          <Row gutter={[24, 24]}>
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <Col xs={24} sm={12} md={6} key={i}>
                    <Skeleton active />
                  </Col>
                ))
              : featuredHotels &&
                featuredHotels.map((hotel) => (
                  <Col xs={24} sm={12} md={6} key={hotel._id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                      cover={
                        <div style={{ height: 220, overflow: "hidden" }}>
                          <img
                            src={hotel.thumbnail}
                            alt={hotel.hotel_name}
                            className="zoom-img"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      }
                      style={{ borderRadius: "12px", overflow: "hidden" }}
                    >
                      <Title level={5} ellipsis style={{ margin: 0 }}>
                        {hotel.hotel_name}
                      </Title>
                      <Space size={4} style={{ marginBottom: 8 }}>
                        <StarOutlined style={{ color: "#fadb14" }} />
                        <Text type="secondary">
                          {hotel.star_level} | <EnvironmentOutlined />{" "}
                          {hotel.hotel_address.split(", ").at(-1)}
                        </Text>
                      </Space>
                      <div style={{ marginTop: "12px" }}>
                        <Text type="danger" strong style={{ fontSize: "18px" }}>
                          {hotel?.price?.toLocaleString()}₫
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
          </Row>
        </div>
      </div>

      <style>{`
        .zoom-img { transition: transform 0.3s; }
        .hover-scale-card:hover .zoom-img { transform: scale(1.1); }
        .hover-scale-card:hover span { color: #1890ff; }
        .ant-card { transition: all 0.3s ease; }
        .ant-card:hover { transform: translateY(-8px); box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important; }
        .ant-card-actions { background: #fafafa; border-top: 1px solid #f0f0f0; }
      `}</style>
    </div>
  );
};

export default Home;
