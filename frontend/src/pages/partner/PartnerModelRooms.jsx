import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Row,
  Col,
  App as AntApp,
  Empty,
  Tag,
  Upload,
  Switch,
} from "antd";
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axiosClient from "../../services/axiosClient";
import CloudinaryUpload from "../../components/common/CloudinaryUpload";
import { ModelRoomApiPartner } from "../../services/apiPartner";
import { capitalize_words } from "../../helpers/capital-word";
import { useCookies } from "react-cookie";
import useHandleSearch from "../../hooks/useHandleSearch";

const { Title, Text } = Typography;

const PartnerModelRooms = () => {
  const { textSearch,handleSearch } = useHandleSearch();

  const [cookies, _] = useCookies();
  const [ModelRooms, setModelRoom] = useState([]);
  const { message: antdMessage, modal: antdModal } = AntApp.useApp();
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [editing_room, set_editing_room] = useState(null);
  const [form] = Form.useForm();

  const [is_loading, set_is_loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const id_partner = cookies.partner.id;
  useEffect(() => {
    const fetchApi = async () => {
      const res = await ModelRoomApiPartner.getAllModelRoom(id_partner);
      console.log(res);
      if (res.status === 200) {
        set_is_loading(false);
        setModelRoom(res.modelRooms);
      }
    };

    fetchApi();
  }, [is_loading, id_partner]);

  const handle_toggle_lock = (record) => {
    const is_currently_locked = record.status === "block";
    const action_text = is_currently_locked ? "mở khóa" : "khóa";

    antdModal.confirm({
      title: `Xác nhận ${action_text} loại phòng?`,
      icon: is_currently_locked ? (
        <UnlockOutlined style={{ color: "#52c41a" }} />
      ) : (
        <LockOutlined style={{ color: "#ff4d4f" }} />
      ),
      content: `Bạn chắc chắn muốn ${action_text} loại phòng "${record.room_type}" chứ?`,
      okText: `Xác nhận ${action_text}`,
      okType: is_currently_locked ? "primary" : "danger",
      onOk: async () => {
        try {
          const new_status = is_currently_locked ? "active" : "block";
          const res = await ModelRoomApiPartner.changeStatusModelRoom(record._id,new_status);
          if(res.status >= 400){
            antdMessage.error(res.message);
            return;
          }

          set_is_loading(true);
          setTimeout(() => {
            antdMessage.success(`Đã ${action_text} loại phòng thành công!`);
            set_is_loading(false);
          }, 1000);
        } catch (error) {
          antdMessage.error("Lỗi hệ thống!");
        }
      },
    });
  };

  const handleEdit = (record) => {
    set_editing_room(record._id);
    form.setFieldsValue(record);
    set_is_modal_open(true);
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
      title: "Loại Phòng",
      dataIndex: "type_room",
      key: "type_room",
      width: "20%",
      render: (text) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Mô tả chi tiết",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Text type="secondary" ellipsis={{ tooltip: text }}>
          {text || "Chưa có mô tả"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag
          color={status.blocked ? "error" : "success"}
          style={{ fontWeight: 500 }}
        >
          {status.blocked ? "ĐÃ KHÓA" : "HOẠT ĐỘNG"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={
              <EditOutlined
                style={{
                  color: record.status === "block" ? "#d9d9d9" : "blue",
                }}
              />
            }
            disabled={record.status === "block"}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={
              record.status === "block" ? (
                <LockOutlined style={{ color: "red" }} />
              ) : (
                <UnlockOutlined style={{ color: "blue" }} />
              )
            }
            onClick={() => handle_toggle_lock(record)}
          />
        </Space>
      ),
    },
  ];

  const on_finish = async (values) => {
    if (editing_room) {
      const res = await ModelRoomApiPartner.updateModelRoom(editing_room,{
        type_room: capitalize_words(values.type_room),
        description: values.description,
      });
      if (res.status >= 400) {
        antdMessage.error(res.message);
        return;
      }

      antdMessage.success(res.message);
      set_is_loading(true);
      setTimeout(() => {
        set_is_loading(false);
        set_is_modal_open(false);
      }, 1000);
    } else {
      const res = await ModelRoomApiPartner.createModelRoom({
        id_partner,
        type_room: capitalize_words(values.type_room),
        description: values.description,
      });
      if (res.status >= 400) {
        antdMessage.error(res.message);
        return;
      }

      antdMessage.success(res.message);
      set_is_loading(true);
      setTimeout(() => {
        set_is_loading(false);
        set_is_modal_open(false);
      }, 1000);
    }
  };

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card variant={false} style={{ marginBottom: 20, borderRadius: 12 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                <HomeOutlined /> Quản lý loại phòng
              </Title>
              <Text type="secondary">
                Cập nhật danh mục và mô tả chi tiết các loại phòng hiện có
              </Text>
            </Col>
          </Row>
        </Card>

        <Card>
          <Row gutter={16} style={{ marginBottom: 20 }} justify="space-between">
            <Col span={12}>
              <Input
                placeholder="Tìm kiếm loại phòng..."
                prefix={<SearchOutlined />}
                
                onChange={(e) => {
                  handleSearch(e)
                  // setSearchText(e.target.value);
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
                onClick={() => {
                  set_editing_room(null);
                  form.resetFields();
                  set_is_modal_open(true);
                }}
                style={{ borderRadius: 8 }}
              >
                Thêm loại phòng mới
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={ModelRooms.filter(item => item.type_room.toLowerCase().includes(textSearch)) || ModelRooms}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total) => `Tổng cộng ${total} loại phòng`,
            }}
            loading={is_loading}
          />
        </Card>

        <Modal
          title={editing_room ? "Cập nhật loại phòng" : "Tạo loại phòng mới"}
          open={is_modal_open}
          onCancel={() => set_is_modal_open(false)}
          onOk={() => form.submit()}
          confirmLoading={is_loading}
          width={600}
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={on_finish}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="type_room"
              label="Tên loại phòng"
              rules={[{ required: true, message: "Nhập tên!" }]}
            >
              <Input
                placeholder="Ví dụ: Deluxe King Room"
                prefix={<FileTextOutlined />}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Nhập mô tả!" }]}
            >
              <Input.TextArea rows={4} placeholder="Mô tả chi tiết..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PartnerModelRooms;
