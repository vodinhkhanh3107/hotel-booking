import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Tag,
  Tooltip,
  Badge,
} from "antd";
import {
  DollarTwoTone,
  FilterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Import dữ liệu từ mockData
import { TRANSACTION_LIST_MOCK } from "../../constants/mockData.jsx";
import { RevenueReportApiPartner } from "../../services/apiPartner.jsx";
import {
  HotelApiAdmin,
  RevenueReportApiAdmin,
} from "../../services/apiAdmin.jsx";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

import { formatDate } from "../../helpers/date.js";

import dayjs from "dayjs";

const AdminRevenues = () => {
  const refDates = useRef(null);
  const refHotelId = useRef();
  const [hotels, setHotel] = useState([]);
  const [totalRevenueSysTem, setTotalRevenueSystem] = useState(0);
  const [transaction_list, setTransactionList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số dòng mỗi trang
  // 1. Kết nối và khởi tạo dữ liệu
  useEffect(() => {
    const fetchApiRevenueReport = async () => {
      const res = await RevenueReportApiAdmin.getRevenueReport();
      if (res.status === 200) {
        setTransactionList(res.revenueReports);
        // 3. Tính toán tổng lợi nhuận Admin dựa trên danh sách hiện tại
        const total_admin_profit = res.revenueReports.reduce((acc, curr) => {
          return curr.revenue_admin + acc;
        }, 0);
        setTotalRevenueSystem(total_admin_profit);
      }
    };

    fetchApiRevenueReport();

    const fetchApiHotel = async () => {
      const res = await HotelApiAdmin.getAllHotelOfPartner("APPROVED");
      if (res.status === 200) {
        setHotel(res.hotels);
      }
    };

    fetchApiHotel();
  }, []);

  // 2. Định dạng tiền VND
  const format_currency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: "Mã giao dịch",
      dataIndex: "code_order",
      key: "code_order",
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: "Khách sạn",
      // dataIndex: "hotel_name",
      key: "hotel_name",
      render: (report) => <Text strong>{hotels && hotels.find(hotel => hotel._id === report.id_hotel)?.hotel_name}</Text>,
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (date) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: "Tổng thu",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      render: (val) => <Text>{format_currency(val)}</Text>,
    },
    {
      title: "Tỷ lệ %",
      dataIndex: "percent_permission",
      key: "percent_permission",
      align: "center",
      render: (rate) => <Tag color="orange">{rate}%</Tag>,
    },
    {
      title: "Thực thu Admin",
      key: "revenue_admin",
      dataIndex: "revenue_admin",
      align: "right",
      render: (revenue_admin) => {
        return (
          <Text strong style={{ color: "#52c41a" }}>
            +{format_currency(revenue_admin)}
          </Text>
        );
      },
    },
  ];

  const handleFilter = async () => {
    if(refDates.current){
      const dateStartFormat = dayjs(refDates.current[0]).format("YYYY-MM-DD");
      const dateEndFormat = dayjs(refDates.current[1]).format("YYYY-MM-DD");
      const id_hotel = refHotelId.current;
      const res = await RevenueReportApiAdmin.getRevenueReportByFilter(
        dateStartFormat,
        dateEndFormat,
        id_hotel,
      );
      if(res.status === 200){
        setTransactionList(res.revenueReports);
      }
    }
    else{
      const id_hotel = refHotelId.current;
      const res = await RevenueReportApiAdmin.getRevenueReportByFilter(
        null,
        null,
        id_hotel,
      );
      if(res.status === 200){
        setTransactionList(res.revenueReports);
      }
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <DollarTwoTone twoToneColor="#52c41a" /> Báo cáo doanh thu
            </Title>
          </Col>
        </Row>
      </Card>
      <Card
        variant={false}
        style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }} align="bottom">
          <Col xs={24} lg={15}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Text strong>
                  <FilterOutlined /> Lọc thời gian:
                </Text>
                <RangePicker
                  style={{ width: "100%", marginTop: 8 }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  onChange={(dates) => {
                    refDates.current = dates
                    handleFilter();
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong>Khách sạn:</Text>
                <Select
                  placeholder="Chọn khách sạn"
                  style={{ width: "100%", marginTop: 8 }}
                  allowClear
                  onChange={(id) => {
                    refHotelId.current = id
                    handleFilter();
                  }}
                >
                  {hotels.map((hotel) => {
                    return (
                      <Select.Option key={hotel._id} value={hotel._id}>
                        {hotel.hotel_name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={9}>
            <Card
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 12,
              }}
            >
              <Statistic
                title={
                  <Space>
                    <Text strong style={{ color: "#389e0d" }}>
                      LỢI NHUẬN HỆ THỐNG
                    </Text>
                    <Tooltip title="Tổng tiền hoa hồng thực nhận">
                      <InfoCircleOutlined style={{ fontSize: "12px" }} />
                    </Tooltip>
                  </Space>
                }
                value={totalRevenueSysTem}
                formatter={(val) => (
                  <span
                    style={{
                      color: "#3f8600",
                      fontWeight: "bold",
                      fontSize: "28px",
                    }}
                  >
                    {format_currency(val)}
                  </span>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={transaction_list}
          rowKey="transaction_id"
          pagination={{ pageSize }}
          onChange={(pagination) => setCurrentPage(pagination.current)}
        />
      </Card>
    </div>
  );
};

export default AdminRevenues;
