import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Row,
  Col,
  Upload,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  PictureOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// Import Cloudinary
import CloudinaryUpload from "../../components/common/CloudinaryUpload.jsx";
// Data mẫu
import {
  MOCK_HOTELS,
  MOCK_ROOMS,
  ALL_AMENITIES,
} from "../../constants/mockData.jsx";
import {
  AmenityApiPartner,
  HotelApiPartner,
  ModelRoomApiPartner,
  RoomApiPartner,
} from "../../services/apiPartner.jsx";
import { useCookies } from "react-cookie";

import useHandleSearch from "../../hooks/useHandleSearch.jsx";

const { Title, Text } = Typography;
const { Option } = Select;

const PartnerRooms = () => {
  const { textSearch, handleSearch } = useHandleSearch();

  const [cookies, _] = useCookies();
  const [loading, setLoading] = useState(true);
  const [Rooms, setRoom] = useState([]);
  const [ModelRooms, setModelRoom] = useState([]);
  const [amenities, setAmenity] = useState([]);
  const [hotels, setHotels] = useState([]);
  console.log(ModelRooms);
  const [form] = Form.useForm();
  const thumbnailPreview = Form.useWatch("thumbnail", form);

  const [selectedHotel, setSelectedHotel] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const id_partner = cookies.partner.id;
  useEffect(() => {
    console.log(id_partner);

    const fetchApiHotel = async () => {
      const res = await HotelApiPartner.getAllHotel(id_partner, "APPROVED");
      console.log(res);
      if (res.status === 200) {
        setHotels(res.hotels);
        setSelectedHotel(res.hotels ? res.hotels[0]?._id : null);
      }
    };

    fetchApiHotel();
  }, [id_partner]);

  useEffect(() => {
    const fetchApiRoom = async () => {
      const res = await RoomApiPartner.getAllRoom(selectedHotel);
      console.log(res);
      if (res.status === 200) {
        setRoom(res.rooms);
      }
    };
    if (selectedHotel) {
      fetchApiRoom();
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [selectedHotel, loading]);

  // State hứng link từ Cloudinary
  const [imageUrl, setImageUrl] = useState("");

  // --- LOGIC XỬ LÝ KHÓA / MỞ KHÓA (CÓ ALERT) ---
  const handleToggleStatus = (record) => {
    const isAvailable = record.blocked;
    const actionText = !isAvailable ? "KHÓA" : "MỞ KHÓA";
    const color = isAvailable ? "#ff4d4f" : "#52c41a";

    Modal.confirm({
      title: `Xác nhận ${actionText} phòng?`,
      icon: <ExclamationCircleOutlined style={{ color }} />,
      content: `Bạn chắc chắn muốn ${actionText} phòng số ${record.number_room} không?`,
      okText: "Đồng ý",
      okType: isAvailable ? "danger" : "primary",
      cancelText: "Hủy bỏ",
      centered: true,
      onOk: async () => {
        try {
          const res = await RoomApiPartner.changeStatus(
            record._id,
            isAvailable,
          );
          console.log(res);
          if (res.status >= 400) {
            message.error(res.message);
            return;
          }

          setLoading(true);
          message.success(res.message);
        } catch (error) {
          message.error("Lỗi hệ thống!");
        }
      },
      // onOk() {
      //   const nextStatus = isAvailable ? "booked" : "available";
      //   setRooms((prev) =>
      //     prev.map((r) =>
      //       r.id_room === record.id_room ? { ...r, status: nextStatus } : r,
      //     ),
      //   );
      //   message.success(
      //     `Đã ${actionText} phòng ${record.room_number} thành công!`,
      //   );
      // },
    });
  };

  // --- XỬ LÝ FORM SUBMIT ---
  const handleSubmit = async (values) => {
    const {
      id_amenities,
      number_room,
      id_room_type,
      capacity,
      price,
      blocked,
      thumbnail,
    } = values;
    const newRoom = {
      id_amenities,
      number_room,
      id_room_type,
      capacity,
      price,
      blocked,
      id_hotel: selectedHotel,
      thumbnail,
    };
    if (editingId) {
      const res = await RoomApiPartner.updateRoom(editingId, newRoom);
      if (res.status >= 400) {
        message.error(res.message);
        return;
      }

      message.success(res.message);
      setLoading(true);
      form.resetFields();
      setTimeout(() => {
        setEditingId(null);
        setIsModalOpen(false);
      }, 1000);
    } else {
      const res = await RoomApiPartner.createRoom(newRoom);
      if (res.status >= 400) {
        message.error(res.message);
        return;
      }

      message.success(res.message);
      setLoading(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    }
  };

  const fetchApiRoomType = async () => {
    const res = await ModelRoomApiPartner.getAllModelRoom(id_partner, "active");
    console.log(res);
    if (res.status === 200) {
      setModelRoom(res.modelRooms);
    }
  };

  const fetchApiAmenity = async () => {
    const res = await AmenityApiPartner.getAllAmenites("active");
    console.log(res);
    if (res.status === 200) {
      setAmenity(res.amenities);
    }
  };

  const handleEdit = (record) => {
    console.log(record);
    setEditingId(record._id);
    form.setFieldsValue({
      ...record,
      status: record.status === "available",
      blocked: !record.blocked
    });
    setIsModalOpen(true);
    fetchApiRoomType();
    fetchApiAmenity();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setImageUrl("");
  };

  const handleCreateRoom = () => {
    setIsModalOpen(true);
    fetchApiRoomType();
    fetchApiAmenity();
  };

  const handleSelectHotel = async (id_hotel) => {
    setSelectedHotel(id_hotel);
    const res = await RoomApiPartner.getAllRoom(id_hotel);
    if (res.status === 200) {
      setLoading(true);
      setRoom(res.rooms);
    }
    console.log(id_hotel);
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
      width: 80,
      render: (src) => (
        <Avatar shape="square" size={60} src={src} icon={<PictureOutlined />} />
      ),
    },
    {
      title: "Số phòng",
      dataIndex: "number_room",
      key: "number_room",
      render: (text) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    { title: "Loại phòng", dataIndex: "type_room", key: "type_room" },
    {
      title: "Tiện nghi",
      dataIndex: "amenityOfRoom",
      key: "amenityOfRoom",
      width: 100,
      render: (amenities) => (
        <Space size={[0, 4]} wrap>
          {amenities &&
            amenities?.map((amenity) => {
              return (
                <Tag color="blue" key={amenity._id}>
                  {amenity ? amenity : ""}
                </Tag>
              );
            })}
        </Space>
      ),
    },
    {
      title: "Giá/Đêm",
      dataIndex: "price",
      key: "price",
      align: "left",
      render: (price) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </Text>
      ),
    },
    {
      title: "Phòng trống",
      dataIndex: "status",
      key: "status",
      align: "left",
      render: (status) => (
        <Tag
          color={status === "inactive" ? "green" : "red"}
          style={{ borderRadius: "10px" }}
        >
          {status === "inactive" ? "PHÒNG TRỐNG" : "ĐANG CÓ NGƯỜI Ở"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "blocked",
      key: "blocked",
      align: "center",
      render: (blocked) => (
        <Tag
          color={!blocked ? "green" : "red"}
          style={{ borderRadius: "10px" }}
        >
          {!blocked ? "SẴN SÀNG" : "ĐÃ KHÓA"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "blue", fontSize: "18px" }} />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={
              record.blocked ? (
                <LockOutlined style={{ color: "red", fontSize: "18px" }} />
              ) : (
                <UnlockOutlined style={{ color: "blue", fontSize: "18px" }} />
              )
            }
            onClick={() => handleToggleStatus(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f7fa", minHeight: "100vh" }}>
      <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <HomeOutlined /> Quản lý phòng
            </Title>
            <Text type="secondary">
              Đồng bộ trạng thái theo đơn đặt phòng thực tế
            </Text>
          </Col>
        </Row>
      </Card>

      <Card variant={false} style={{ borderRadius: 12 }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              value={selectedHotel}
              onChange={(id_hotel) => handleSelectHotel(id_hotel)}
            >
              {hotels &&
                hotels.map((h) => (
                  <Option key={h._id} value={h._id}>
                    {h.hotel_name}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col span={8}>
            <Input
              placeholder="Tìm số phòng, tên loại phòng, giá tiền..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e)}
            />
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateRoom}
            >
              Thêm phòng mới
            </Button>
          </Col>
        </Row>

        <Table
          loading={loading}
          columns={columns}
          dataSource={
            Rooms.filter(
              (room) =>
                room.number_room.toLowerCase().includes(textSearch) ||
                room.type_room.toLowerCase().includes(textSearch) ||
                room.price.toString().includes(textSearch),
            ) || Rooms
          }
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total) => `Tổng cộng ${total} phòng`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Cập nhật thông tin phòng" : "Thêm phòng mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editingId ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        centered
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true, amenities: [] }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="number_room"
                label="Số phòng"
                rules={[{ required: true, message: "Nhập số phòng!" }]}
              >
                <Input placeholder="VD: 101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="id_room_type"
                label="Loại phòng"
                rules={[{ required: true, message: "Chọn loại phòng!" }]}
              >
                <Select placeholder="Chọn loại">
                  {ModelRooms &&
                    ModelRooms.map((model_room) => (
                      <Option key={model_room._id} value={model_room._id}>
                        {model_room.type_room}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="price"
            label="Giá mỗi đêm (VNĐ)"
            rules={[{ required: true, message: "Nhập giá phòng!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/\D/g, "")}
            />
          </Form.Item>

          <Form.Item name="capacity" label="Sức chứa(Số người/phòng)">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="id_amenities" label="Tiện nghi phòng">
            <Select mode="multiple" placeholder="Chọn tiện nghi" allowClear>
              {amenities.map((amenity) => (
                <Option key={amenity._id} value={amenity._id}>
                  {amenity.name_amenity}
                </Option>
              ))}
            </Select>
          </Form.Item>

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

          <Form.Item
            name="blocked"
            label="Trạng thái sẵn sàng"
            valuePropName="checked"
            
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnerRooms;
