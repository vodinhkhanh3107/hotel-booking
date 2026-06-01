import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  Typography,
  Alert,
  Row,
  Col,
  message,
  Modal,
  Input,
  Badge,
  Descriptions,
  Avatar,
  Tooltip,
  Form,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  KeyOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

// IMPORT MOCK DATA
import { AccountApiAdmin, UserApiAdmin } from "../../services/apiAdmin.jsx";

import avartar from "../../../public/avartar.jpg";
import { formatDate } from "../../helpers/date.js";
import { useCookies } from "react-cookie";
import useHandleSearch from "../../hooks/useHandleSearch.jsx";

const { Title, Text } = Typography;

const UserManagement = () => {
  const { textSearch, handleSearch } = useHandleSearch();
  const [cookies, _] = useCookies(["admin"]);
  const [accounts, setAccount] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho modal
  const [is_modal_open, setIsModalOpen] = useState(false);
  const [selected_user, setSelectedUser] = useState(null);
  const [is_add_modal_open, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Số dòng mỗi trang
  // Khởi tạo dữ liệu
  useEffect(() => {
    const fetchApi = async () => {
      const res = await UserApiAdmin.getAllUser();
      setAccount([
        ...res.accounts.admin,
        ...res.accounts.partner,
        ...res.accounts.user,
      ]);
    };

    fetchApi();
  }, [loading]);


  const handle_toggle_status = (id_account, status, role, full_name) => {
    const action = status === "active" ? "KHÓA" : "MỞ KHÓA";

    Modal.confirm({
      title: `Xác nhận ${action} tài khoản?`,
      content: `Người dùng ${full_name} sẽ ${status === "active" ? "không thể" : "có thể"} đăng nhập.`,
      onOk: async () => {
        try {
          const res = await AccountApiAdmin.updateStatusAccount({
            id_account,
            status,
            role,
          });
          if (res.status === 200) {
            message.success(res.message);
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 1000);
          }
        } catch (error) {
          console.log(error);
          message.error("Lỗi hệ thống!");
        }
      },
    });
  };

  const handleAddAdmin = async (values) => {
    if (accounts.some((account) => account.email === values.email)) {
      message.error("Email này đã tồn tại!");
      return;
    }

    const new_admin = {
      email: values.email,
      full_name: values.full_name,
      phone: values.phone || "N/A",
      password: values.password,
      confirm_password: values.confirm_password,
    };
    const res = await UserApiAdmin.createAdmin(new_admin);
    if (res.status >= 400) {
      message.error("Tạo tài khoản thất bại");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      message.success("Đã tạo tài khoản Admin Cấp 2 thành công!");
      setIsAddModalOpen(false);
      form.resetFields();
    }, 1000);
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_,__,index) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: "Người dùng",
      key: "full_name",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avartar ? record.avartar : avartar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: record?.level === 1 ? "#f5222d" : "#1677ff",
            }}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.full_name}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role, record) => {
        if (record?.level === 1)
          return (
            <Tag color="volcano" icon={<CrownOutlined />}>
              ADMIN CẤP 1
            </Tag>
          );
        if (role === "Admin") return <Tag color="blue">ADMIN CẤP 2</Tag>;
        if (role === "Đối tác") return <Tag color="purple">ĐỐI TÁC</Tag>;
        return <Tag color="default">KHÁCH HÀNG</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "error"}
          text={
            <Tag color={status === "active" ? "blue" : "red"}>
              {status === "active" ? "Hoạt động" : "Đã khóa"}
            </Tag>
          }
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record) =>
        !(cookies.admin.id === record._id) && (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedUser(record);
                  setIsModalOpen(true);
                }}
              />
            </Tooltip>

            {record?.level !== 1 && cookies.admin.level !== record.level && (
              <Tooltip
                title={
                  record.status === "active" ? "Khóa tài khoản" : "Mở khóa"
                }
              >
                <Button
                  size="small"
                  icon={
                    record.status === "active" ? (
                      <UnlockOutlined />
                    ) : (
                      <LockOutlined />
                    )
                  }
                  type={record.status === "active" ? "primary" : "default"}
                  danger={record.status !== "active"}
                  onClick={() =>
                    handle_toggle_status(
                      record._id,
                      record.status,
                      record.role,
                      record.full_name,
                    )
                  }
                />
              </Tooltip>
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
              <UserOutlined /> Quản lý người dùng
            </Title>
          </Col>
        </Row>
      </Card>
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Space>
            <Input
              placeholder="Tìm tên, email hoặc tài khoản..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 280, borderRadius: 8 }}
              onChange={(e) => handleSearch(e)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              style={{ borderRadius: 8, fontWeight: 500 }}
            >
              Thêm Admin
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={accounts.filter(
            (account) =>
              account.full_name
                ?.toLowerCase()
                .includes(textSearch) ||
              account.email
                ?.toLowerCase()
                .includes(textSearch) ||
              account.role?.toLowerCase().includes(textSearch),
          )}
          rowKey="_id"
          pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total) => `Tổng cộng ${total} người dùng`,
            }}
        />

        {/* MODAL XEM CHI TIẾT */}
        <Modal
          title="Thông tin người dùng"
          open={is_modal_open}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Đóng
            </Button>,
          ]}
        >
          {selected_user && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Họ và tên">
                {selected_user.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selected_user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selected_user.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color="blue">{selected_user.role.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {formatDate(selected_user.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* MODAL THÊM ADMIN CẤP 2 */}
        <Modal
          title={
            <Title level={4} style={{ margin: 0 }}>
              Tạo tài khoản Admin Cấp 2
            </Title>
          }
          open={is_add_modal_open}
          onCancel={() => {
            setIsAddModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText="Xác nhận tạo"
          cancelText="Hủy"
          width={500}
          loading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddAdmin}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên đầy đủ" />
            </Form.Item>

            <Space style={{ display: "flex" }} align="baseline">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Email không hợp lệ!",
                  },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email liên lạc" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Space>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Nhập lại mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>

            <Alert
              message="Tài khoản này sẽ được cấp quyền Admin Cấp 2 theo mặc định hệ thống."
              type="info"
              showIcon
            />
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default UserManagement;
