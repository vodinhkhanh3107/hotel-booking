import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Row,
  Col,
  Image,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  AppstoreOutlined,
  SearchOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import CloudinaryUpload from "../../components/common/CloudinaryUpload";

import { HOTEL_TYPES } from "../../constants/mockData.jsx";
import { ModelHotelApiAdmin } from "../../services/apiAdmin.jsx";
import useHandleSearch from "../../hooks/useHandleSearch.jsx";

const { Title, Text } = Typography;

const AdminCategories = () => {
  const { textSearch, handleSearch } = useHandleSearch();
  
  const [ModelHotel, setModelHotel] = useState([]);
  const [loading, setLoading] = useState(false);

  const [is_modal_visible, setIsModalVisible] = useState(false);
  const [editing_key, setEditingKey] = useState(null);
  const [form] = Form.useForm();
  const thumbnailPreview = Form.useWatch("thumbnail", form);

  // const [categories_list, setCategoriesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số dòng mỗi trang
  useEffect(() => {
    const fetchApi = async () => {
      const res = await ModelHotelApiAdmin.getAllModelHotel();
      if (res.status >= 400) {
        message.error(res.message);
      }
      setModelHotel(res.modelHotels);
    };

    fetchApi();
  }, [loading]);


  const handle_toggle_status = (record) => {
    const is_active = record.status === "active";
    const action_text = is_active ? "KHÓA" : "MỞ KHÓA";

    Modal.confirm({
      title: `Xác nhận ${action_text} loại khách sạn?`,
      content: `Bạn đang chuẩn bị ${action_text.toLowerCase()} loại khách sạn: ${record.category_name}`,
      okText: action_text,
      okType: is_active ? "danger" : "primary",
      centered: true,
      // onOk: () => {
      //   const new_list = categories_list.map((item) => {
      //     if (item.key === record.key) {
      //       return { ...item, status: is_active ? "blocked" : "active" };
      //     }
      //     return item;
      //   });
      //   message.success(`Đã ${action_text} thành công!`);
      // },
    });
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
      key: "thumbnail",
      width: 100,
      align: "center",
      render: (thumbnail) => (
        <Image
          shape="square"
          size={60}
          src={thumbnail}
          icon={<PictureOutlined />}
          fallback="https://via.placeholder.com/800x400?text=No+Hotel+Image"
        />
      ),
    },
    {
      title: "Loại khách sạn",
      dataIndex: "model_hotel",
      key: "model_hotel",
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
    },

    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc) => (
        <Text type="secondary" italic>
          {desc || "Chưa có mô tả chi tiết..."}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (status) => {
        const isActive = !status || status === "active";
        return (
          <Tag
            color={isActive ? "blue" : "red"}
            //icon={isActive ? <UnlockOutlined /> : <LockOutlined />}
            style={{ borderRadius: "4px", padding: "2px 8px" }}
          >
            {isActive ? "Đang mở" : "Đang khóa"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => {
        const is_active = !record.status || record.status === "active";
        return (
          <Space size="small">
            <Tooltip
              title={is_active ? "Chỉnh sửa" : "Không thể sửa khi đang khóa"}
            >
              <Button
                type="text"
                icon={<EditOutlined />}
                // VÔ HIỆU HÓA NÚT SỬA KHI ĐANG KHÓA
                disabled={!is_active}
                onClick={() => handle_edit_click(record)}
              />
            </Tooltip>

            <Tooltip title={is_active ? "Nhấn để Khóa" : "Nhấn để Mở khóa"}>
              <Button
                type="text"
                icon={
                  is_active ? (
                    <UnlockOutlined
                      style={{ color: "blue", fontSize: "16px" }}
                    />
                  ) : (
                    <LockOutlined style={{ color: "red", fontSize: "16px" }} />
                  )
                }
                onClick={() => handle_toggle_status(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handle_edit_click = (record) => {
    setEditingKey(record._id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };
  const handle_submit = async (values) => {
    if (editing_key) {
      const res = await ModelHotelApiAdmin.updateModelHotel(editing_key,values);
      if (res.status >= 400) {
        setLoading(false)
        message.error(res.message);
        return;
      }
      message.success(res.message);
      setLoading(true);
      setTimeout(() => {
        setIsModalVisible(false);
        form.resetFields();
      }, 1000);
    } else {
      const res = await ModelHotelApiAdmin.createModelHotel(values);
      if (res.status >= 400) {
        setLoading(false)
        message.error(res.message);
        return;
      }
      message.success(res.message);
      setLoading(true);
      setTimeout(() => {
        setLoading(false)
        setIsModalVisible(false);
        form.resetFields();
      }, 1000);
    }
  };


  return (
    <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <AppstoreOutlined /> Quản lý loại khách sạn
            </Title>
          </Col>
        </Row>
      </Card>
      <Card>
        <Row gutter={16} style={{ marginBottom: 20 }} justify="space-between">
          <Col span={12}>
            <Input
              placeholder="Tìm kiếm loại khách sạn..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e)}
              allowClear
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 8, fontWeight: 500 }}
              onClick={() => {
                setEditingKey(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm loại khách sạn mới
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={ModelHotel.filter(item => item.model_hotel.toLowerCase().includes(textSearch))}
          rowKey="_id"
          pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total) => `Tổng cộng ${total} loại khách sạn`,
            }}
        />
      </Card>

      <Modal
        title={editing_key ? "CẬP NHẬT THÔNG TIN" : "THÊM LOẠI MỚI"}
        open={is_modal_visible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        okText={editing_key ? "Lưu lại" : "Thêm mới"}
        cancelText="Hủy bỏ"
        centered
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handle_submit}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="model_hotel"
            label="Tên loại khách sạn"
            rules={[{ required: true, message: "Không được để trống!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Ảnh minh họa" name="thumbnail">
            <Space direction="vertical" style={{ width: "100%" }}>
              {/* Tích hợp Cloudinary */}
              <CloudinaryUpload
                onUploadSuccess={(url) => {
                  form.setFieldValue("thumbnail", url); // Cập nhật vào form để đồng bộ
                  // setThumbnail(url);
                }}
              />
              {thumbnailPreview && (
                <div style={{ marginTop: 10 }}>
                  <Space vertical>
                    <Text type="secondary">Xem trước:</Text>
                    <Avatar shape="square" size={80} src={thumbnailPreview} />
                  </Space>
                </div>
              )}
            </Space>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
