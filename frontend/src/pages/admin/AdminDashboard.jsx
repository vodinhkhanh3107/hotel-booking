import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Space,
  DatePicker,
  Tag,
  Progress,
  Tooltip,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingOutlined,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  REVENUE_MOCK,
  TOP_HOTELS_MOCK,
  REPORT_SUMMARY_MOCK,
} from "../../constants/mockData.jsx";
import { DashboardApiAdmin } from "../../services/apiAdmin.jsx";

const { Title, Text } = Typography;

const AdminReports = () => {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [revenue_data, setRevenueData] = useState([]);
  const [top_hotels, setTopHotels] = useState([]);
  const [report_summary, setReportSummary] = useState(null);

  useEffect(() => {
    const fetchApiDashboard = async () => {
      const res = await DashboardApiAdmin.getDashboard();
      if (res.status === 200) {
        setReportSummary(res.statisticalAdmin);
      }
    };
    fetchApiDashboard();

    const fetchApiRevenue = async () => {
      const res = await DashboardApiAdmin.getRevenueOfYear(selectedYear);
      if (res.status === 200) {
        setRevenueData(res.orderInYears);
      }
    };
    fetchApiRevenue();

    const fetchApiTopHotelRevenue = async () => {
      const res = await DashboardApiAdmin.getTopHotelRevenue(selectedYear);
      if (res.status === 200) {
        setTopHotels(res.hotels);
      }
    };

    fetchApiTopHotelRevenue();
  }, [selectedYear]);

  const format_currency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          <ShoppingOutlined /> Tổng quan kinh doanh hệ thống
        </Title>
        <Space>
          <Text strong>Thời gian báo cáo (Năm):</Text>
          <DatePicker
            picker="year"
            placeholder="Chọn năm"
            style={{ borderRadius: "8px", width: "150px" }}
            defaultValue={dayjs()}
            disabledDate={(current) =>
              current && current.year() > dayjs().year()
            }
            onChange={(date) => date && setSelectedYear(date.year())}
          />
        </Space>
      </div>

      {/* Cards Thống kê nhanh */}
      {report_summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant={false}
              hoverable
              style={{ borderRadius: "12px", borderLeft: "4px solid #52c41a" }}
            >
              <Statistic
                title={
                  <Space>
                    Doanh thu tháng này
                    <Tooltip title="Tổng tiền sau khi trừ chiết khấu">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                value={report_summary?.revenueOfCurrentMonth?.total_amount}
                formatter={(val) => (
                  <Text
                    style={{
                      color: "#3f8600",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  >
                    {format_currency(val)}
                  </Text>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant={false}
              hoverable
              style={{ borderRadius: "12px", borderLeft: "4px solid #1890ff" }}
            >
              <Statistic
                title="Tổng số đơn đặt phòng"
                value={report_summary?.revenueOfCurrentMonth?.total_order}
                prefix={<ShoppingOutlined />}
                styles={{ content: { color: "#1890ff", fontWeight: "bold" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant={false}
              hoverable
              style={{ borderRadius: "12px", borderLeft: "4px solid #faad14" }}
            >
              <Statistic
                title="Tổng số khách hàng"
                value={report_summary.totalUsers}
                prefix={<UserOutlined />}
                styles={{ content: { fontWeight: "bold" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant={false}
              hoverable
              style={{ borderRadius: "12px", borderLeft: "4px solid #722ed1" }}
            >
              <Statistic
                title="Đối tác hoạt động"
                value={report_summary.totalPartners}
                prefix={<HomeOutlined />}
                styles={{ content: { color: "#722ed1", fontWeight: "bold" } }}
              />
              {/* <Tag color="purple" style={{ marginTop: 4 }}>{report_summary.active_partners} Khách sạn mới</Tag> */}
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* Bảng Doanh thu */}
        <Col xs={24} lg={15}>
          <Card
            title="Biểu đồ tăng trưởng doanh thu"
            variant={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Table
              dataSource={revenue_data}
              rowKey="key"
              pagination={false}
              size="middle"
              columns={[
                {
                  title: "Kỳ báo cáo",
                  dataIndex: "month",
                  key: "month",
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: "Doanh thu thực tế",
                  dataIndex: "total_amount",
                  key: "total_amount",
                  render: (val) => (
                    <Text type="danger" strong>
                      {format_currency(val)}
                    </Text>
                  ),
                },
                {
                  title: "Số lượng đơn",
                  dataIndex: "total_order",
                  key: "total_order",
                  align: "center",
                },
                {
                  title: "So với tháng trước",
                  // dataIndex: 'revenue_difference',
                  key: "revenue_difference",
                  render: (value) =>
                    value.revenue_difference !== 0 && (
                      <Tag
                        icon={
                          value.revenue_difference > 0 ? (
                            <ArrowUpOutlined />
                          ) : (
                            <ArrowDownOutlined />
                          )
                        }
                        color={value.revenue_difference > 0 ? "green" : "red"}
                      >
                        {value.revenue_difference > 0 ? "TĂNG" : "GIẢM "}{" "}
                        {value.revenue_growth_percent}%
                      </Tag>
                    ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Khách sạn doanh thu cao nhất */}
        <Col xs={24} lg={9}>
          <Card
            title="Khách sạn doanh thu cao nhất theo từng năm"
            variant={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {top_hotels &&
              top_hotels.map((item, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <Text strong style={{ maxWidth: "180px" }} ellipsis>
                      {item?.hotel_name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      {format_currency(item.total_revenue)}
                    </Text>
                  </div>
                  <Tooltip title={`Tỷ lệ lấp đầy: ${item.occupancy_rate}%`}>
                    <Progress
                      percent={item.occupancy_rate}
                      showInfo={false}
                      strokeColor={index === 0 ? "#52c41a" : "#1890ff"}
                      size={12}
                    />
                  </Tooltip>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "2px",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      Top {index + 1}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {item.total_order} đơn thành công
                    </Text>
                  </div>
                </div>
              ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminReports;
