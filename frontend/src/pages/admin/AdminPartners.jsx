import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Typography,
  Modal,
  Descriptions,
  Badge,
  Tabs,
  App as AntApp,
  Empty,
  Image,
  Row,
  Col,
  Input,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  SafetyOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { HotelApiAdmin } from "../../services/apiAdmin";

import { formatDate } from "../../helpers/date";
import { useOutletContext } from "react-router-dom";
import useHandleSearch from "../../hooks/useHandleSearch";

const { Title, Text } = Typography;

const AdminPartners = () => {
  const { textSearch, handleSearch } = useHandleSearch();

  const { fetchPendingCount } = useOutletContext();
  const [hotelPartner, setHotelPartner] = useState([]);
  const [loading, setLoading] = useState(true);

  const { message: antd_message } = AntApp.useApp();
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [selected_partner, set_selected_partner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số dòng mỗi trang

  useEffect(() => {
    const fetchApi = async () => {
      const res = await HotelApiAdmin.getAllHotelOfPartner();
      if (res.status >= 400) {
        antd_message.error(res.message);
        return;
      }
      setLoading(false);
      setHotelPartner(res.hotels);
    };
    fetchApi();
  }, [antd_message,loading]);

  const handleUpdateStatus = (id_hotel, status) => {
    switch (status) {
      case "APPROVED":
        Modal.confirm({
          title: "Xác nhận phê duyệt đối tác?",
          content:
            "Sau khi duyệt, khách sạn này sẽ chính thức hiển thị và hoạt động trên hệ thống.",
          okText: "Xác nhận duyệt",
          cancelText: "Hủy",
          centered: true,
          confirmLoading: loading,
          onOk: async () => {
            const res = await HotelApiAdmin.updateChangeStatusHotel(
              id_hotel,
              status,
            );
            if (res.status >= 400) {
              return antd_message.error(res.message);
            }

            await fetchPendingCount();
            setLoading((prev) => !prev);
            antd_message.success(res.message);
          },
        });
        return;
      case "REJECTED":
        Modal.confirm({
          title: "Xác nhận từ chối phê duyệt đối tác?",
          content: "Nếu bạn từ chối thì đối tác này sẽ không được hoạt động.",
          okText: "Xác nhận từ chối",
          cancelText: "Hủy",
          centered: true,
          confirmLoading: loading,
          onOk: async () => {
            const res = await HotelApiAdmin.updateChangeStatusHotel(
              id_hotel,
              status,
            );
            if (res.status >= 400) {
              return antd_message.error(res.message);
            }
            await fetchPendingCount();
            setLoading((prev) => !prev);
            antd_message.success(res.message);
          },
        });
        return;
    }
  };

  const handlePagination = (page) => {
    console.log(page);
    setCurrentPage(page);
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
      title: "Tên cơ sở",
      dataIndex: "hotel_name",
      key: "hotel_name",
      width: 200,
      align: "center",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Loại hình",
      dataIndex: "model_hotel",
      key: "model_hotel",
      width: 120,
      align: "center",
      render: (model_hotel) => (
        <Tag color="blue">{model_hotel?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Ngày gửi đơn",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      align: "center",
      render: (date) => formatDate(date) || "12/04/2026",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      align: "center",
      render: (status) => {
        const config = {
          APPROVED: { color: "green", text: "ĐÃ DUYỆT" },
          PENDING: { color: "orange", text: "CHỜ DUYỆT" },
          REJECTED: { color: "red", text: "TỪ CHỐI" },
        };
        const current = config[status] || {
          color: "default",
          text: "CHỜ DUYỆT",
        };
        return (
          <Tag color={current.color} style={{ fontWeight: 600 }}>
            {current.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              set_selected_partner(record);
              set_is_modal_open(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === "PENDING" && (
            <Space>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record._id, "APPROVED")}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleUpdateStatus(record._id, "REJECTED")}
              >
                Từ chối
              </Button>
            </Space>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <SafetyOutlined /> Phê duyệt yêu cầu đối tác
            </Title>
          </Col>
        </Row>
      </Card>
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <Tabs
          defaultActiveKey="2"
          tabBarExtraContent={
            <Input
              placeholder="Tìm tên cơ sở, mã khách sạn..."
              prefix={<SearchOutlined />}
              allowClear
              size="large"
              style={{ width: 320, borderRadius: 8, marginBottom: 8 }}
              onChange={(e) => handleSearch(e)}
            />
          }
          items={[
            {
              key: "1",
              label: (
                <span>
                  Yêu cầu chờ duyệt
                  <Badge
                    count={
                      hotelPartner.filter((p) => p.status === "PENDING").length
                    }
                    style={{ marginLeft: 8, backgroundColor: "#faad14" }}
                  />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={hotelPartner.filter(
                    (hotel) => hotel.status === "PENDING",
                  )}
                  rowKey="_id"
                />
              ),
            },
            {
              key: "2",
              label: "Tất cả đối tác",
              children: (
                <Table
                  pagination={{
                    onChange: (page) => handlePagination(page),
                    current: currentPage,
                  }}
                  columns={columns}
                  dataSource={
                    hotelPartner.filter((hotel) =>
                      hotel.hotel_name?.toLowerCase().includes(textSearch),
                    ) || hotelPartner
                  }
                  rowKey="_id"
                  loading={loading}
                />
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title={
          <Space>
            <EyeOutlined /> Chi tiết hồ sơ đăng ký
          </Space>
        }
        open={is_modal_open}
        onCancel={() => set_is_modal_open(false)}
        width={750}
        centered
        footer={[
          <Button key="close" onClick={() => set_is_modal_open(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selected_partner ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <Image
                src={selected_partner.thumbnail}
                alt="hotel"
                style={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
                fallback="https://via.placeholder.com/800x400?text=No+Hotel+Image"
              />
            </div>

            <Row gutter={[16, 16]}>
              <Col span={14}>
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  labelStyle={{ width: "30%" }}
                  contentStyle={{ width: "70%" }}
                >
                  <Descriptions.Item label="Tên khách sạn">
                    {selected_partner.hotel_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại hình">
                    <Tag color="blue">
                      {selected_partner.model_hotel?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hạng sao">
                    {selected_partner.star_level} ⭐
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiết khấu">
                    {selected_partner.percent_permission || "0"}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {selected_partner.hotel_address}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả khách sạn" span={3}>
                    <div style={{ minHeight: 60 }}>
                      {selected_partner.description || "Không có mô tả."}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        ) : (
          <Empty />
        )}
      </Modal>
    </div>
  );
};

export default AdminPartners;
