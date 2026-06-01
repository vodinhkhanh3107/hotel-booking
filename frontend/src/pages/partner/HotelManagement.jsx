import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Row,
  Col,
  App as AntApp,
  Avatar,
  InputNumber,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// Import thêm component Cloudinary
import CloudinaryUpload from "../../components/common/CloudinaryUpload";

// ĐÃ CẬP NHẬT: Chỉ giữ lại các import cần thiết
import {
  HotelApiPartner,
  ModelHotelPartner,
} from "../../services/apiPartner.jsx";
import { useCookies } from "react-cookie";

import useHandleSearch from "../../hooks/useHandleSearch.jsx";

const { Title, Text } = Typography;
const { TextArea } = Input;

const HotelManagement = () => {
  const { textSearch, handleSearch } = useHandleSearch();

  const [ModelHotels, setModelHotel] = useState([]);
  const [cookies, _] = useCookies();
  const [Hotels, setHotel] = useState([]);
  const [isOpenModalApprove, setIsModalApproveOpen] = useState(false);

  const { message: antdMessage, modal: antdModal } = AntApp.useApp();
  const [form] = Form.useForm();
  const thumbnailPreview = Form.useWatch("thumbnail", form);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const id_partner = cookies.partner.id;
  useEffect(() => {
    const fetchApiHotel = async () => {
      const res = await HotelApiPartner.getAllHotel(id_partner);
      if (res.status === 200) {
        setHotel(res.hotels);
      }
    };

    fetchApiHotel();
    const fetchApiModelHotel = async () => {
      const res = await ModelHotelPartner.getAllModelHotel();
      if (res.status === 200) {
        setModelHotel(res.modelHotels);
      }
    };

    fetchApiModelHotel();
  }, [loading, id_partner]);

  const handleToggleLock = (record) => {
    const isCurrentlyLocked = record.blocked;
    const actionText = !isCurrentlyLocked ? "khóa" : "mở khóa";

    antdModal.confirm({
      title: `Xác nhận ${actionText} khách sạn?`,
      icon: !isCurrentlyLocked ? (
        <LockOutlined style={{ color: "#ff4d4f" }} />
      ) : (
        <UnlockOutlined style={{ color: "#52c41a" }} />
      ),
      content: `Bạn chắc chắn muốn ${actionText} "${record.hotel_name}" chứ?`,
      okText: `Xác nhận ${actionText}`,
      okType: !isCurrentlyLocked ? "primary" : "danger",
      onOk: async () => {
        const res = await HotelApiPartner.changeBlockHotel(
          record._id,
          !isCurrentlyLocked,
        );
        if (res.status >= 400) {
          antdMessage.error(res.message);
          return;
        }

        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          antdMessage.success(res.message);
        }, 1000);
      },
    });
  };

  const onFinish = async (values) => {
    const {
      hotel_name,
      id_model_hotel,
      hotel_address,
      star_level,
      percent_permission,
      description,
    } = values;
    const newHotel = {
      id_partner: id_partner,
      hotel_name,
      id_model_hotel,
      hotel_address,
      star_level,
      percent_permission,
      thumbnail: thumbnailPreview,
      description,
    };
    if (editingId) {
      try {
        const res = await HotelApiPartner.updateHotel(editingId, newHotel);
        if (res.status >= 400) {
          antdMessage.error(res.message);
          return;
        }

        antdMessage.success(res.message);
        setLoading(true);
        setTimeout(() => {
          setEditingId(null);
          form.resetFields();
          setLoading(false);
          setIsModalOpen(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        antdMessage.error("Lỗi hệ thống!");
        setLoading(false);
      }
    } else {
      try {
        const res = await HotelApiPartner.registerHotel(newHotel);
        if (res.status >= 400) {
          antdMessage.error(res.message);
          return;
        }

        antdMessage.success(res.message);
        setLoading(true);
        setTimeout(() => {
          setEditingId(null);
          form.resetFields();
          setLoading(false);
          setIsModalOpen(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        antdMessage.error("Lỗi hệ thống!");
        setLoading(false);
      }
    }
  };

  const handleSetValuesForm = (record) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleResetValueForm = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleReApproved = (record) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
    setIsModalApproveOpen(true);
  };

  const handleSubmitReApproved = async () => {
    try {
      const res = await HotelApiPartner.reApprovedHotel(editingId,{status: "123"});
      if (res.status >= 400) {
        antdMessage.error(res.message);
        return;
      }

      antdMessage.success(res.message);
      setLoading(true);
      setTimeout(() => {
        setEditingId(null);
        setLoading(false);
        form.resetFields();
        setIsModalApproveOpen(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      antdMessage.error("Lỗi hệ thống!");
      setLoading(false);
    }
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
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      width: 100,
      render: (src) => (
        <Avatar shape="square" size={64} src={src} icon={<ShopOutlined />} />
      ),
    },
    {
      title: "Thông tin khách sạn",
      width: 300,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 15, display: "block" }}>
            {record.hotel_name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <EnvironmentOutlined /> {record.hotel_address}
          </Text>
        </div>
      ),
    },
    // ĐÃ XÓA: Cột Tiện nghi
    {
      title: "Chiết khấu",
      dataIndex: "percent_permission",
      width: 100,
      align: "center",
      render: (percent_permission) => (
        <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>
          {percent_permission ? `${percent_permission}%` : "0%"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      // dataIndex: "status",
      key: "status",
      width: 150,
      render: (record) => {
        const configs = {
          APPROVED: { color: "success", text: "ĐÃ DUYỆT" },
          PENDING: { color: "warning", text: "CHỜ DUYỆT" },
          REJECTED: { color: "error", text: "BỊ TỪ CHỐI" },
        };
        const config = configs[record.status] || configs.PENDING;
        return (
          <Space>
            {record.status === "REJECTED" && (
              <Button
                size="small"
                type="primary"
                ghost
                icon={<ReloadOutlined />}
                onClick={() => handleReApproved(record)}
              >
                Đăng ký lại
              </Button>
            )}
            <Tag color={config.color} style={{ fontWeight: "bold" }}>
              {config.text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      align: "right",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={
              <EditOutlined
                style={{ color: record.blocked ? "#d9d9d9" : "blue" }}
              />
            }
            disabled={record.blocked}
            onClick={() => handleSetValuesForm(record)}
          />
          <Button
            size="small"
            type="text"
            icon={
              record.blocked ? (
                <LockOutlined style={{ color: "red" }} />
              ) : (
                <UnlockOutlined style={{ color: "blue" }} />
              )
            }
            onClick={() => handleToggleLock(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Frame trên: Tiêu đề */}
        <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <ShopOutlined /> Quản lý khách sạn
              </Title>
              <Text type="secondary">
                Quản lý thông tin và trạng thái các khách sạn
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Frame dưới: Nút thêm mới nằm TRONG Card của bảng */}
        <Card>
          <Row gutter={16} style={{ marginBottom: 20 }} justify="space-between">
            <Col span={12}>
              <Input
                placeholder="Tìm kiếm khách sạn..."
                prefix={<SearchOutlined />}
                onChange={(e) => {
                  handleSearch(e);
                  // setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm để không bị lỗi No Data
                }}
                allowClear
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleResetValueForm}
                style={{ borderRadius: 8, height: 40 }}
              >
                Đăng ký khách sạn mới
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={
              Hotels.filter((hotel) =>
                hotel.hotel_name.toLowerCase().includes(textSearch),
              ) || Hotels
            }
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total) => `Tổng cộng ${total} khách sạn`,
            }}
            loading={loading}
          />
        </Card>

        {/* Modal Thêm/Sửa */}
        <Modal
          title={
            editingId ? "Cập nhật thông tin khách sạn" : "Đăng ký khách sạn mới"
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
          }}
          onOk={() => form.submit()}
          confirmLoading={loading}
          okText={editingId ? "Cập nhật" : "Đăng ký"}
          cancelText="Hủy"
          width={700}
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ marginTop: 20 }}
          >
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="hotel_name"
                  label="Tên khách sạn"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  <Input placeholder="Ví dụ: Vinpearl Luxury..." />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="id_model_hotel"
                  label="Loại hình"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Chọn loại hình"
                    options={
                      ModelHotels &&
                      ModelHotels.map((type) => ({
                        value: type._id,
                        label: type.model_hotel,
                      }))
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="hotel_address"
              label="Địa chỉ"
              rules={[{ required: true }]}
            >
              <Input
                prefix={<EnvironmentOutlined />}
                placeholder="Số nhà, đường, thành phố..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="star_level" label="Hạng sao" initialValue={5}>
                  <Select
                    options={[1, 2, 3, 4, 5].map((s) => ({
                      value: s,
                      label: `${s} Sao`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="percent_permission"
                  label="Chiết khấu (%)"
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                    style={{ width: "100%" }}
                    disabled={form.getFieldValue("status") === "APPROVED"}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Hình ảnh khách sạn" name="thumbnail">
              {/* COMPONENT CLOUDINARY ĐƯỢC CHÈN VÀO ĐÂY */}
              <CloudinaryUpload
                onUploadSuccess={(url) => {
                  form.setFieldValue("thumbnail", url);
                }}
              />
              {thumbnailPreview && (
                <div style={{ marginTop: 10 }}>
                  <Space vertical>
                    <Text>Xem trước</Text>
                    <Avatar src={thumbnailPreview} size={80} shape="square" />
                  </Space>
                </div>
              )}
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả ngắn gọn về khách sạn..."
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Duyệt lại khách sạn"
          cancelText="Hủy"
          okText="Xác nhận"
          open={isOpenModalApprove}
          onOk={handleSubmitReApproved}
          width={500}
          onCancel={() => {
            setEditingId(null);
            form.resetFields();
            setIsModalApproveOpen(false);
          }}
        >
          Xác nhận đăng ký lại khách sạn {form.getFieldValue("hotel_name")}
        </Modal>
      </div>
    </div>
  );
};

export default HotelManagement;
