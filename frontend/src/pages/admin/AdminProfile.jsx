import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Avatar,
  Typography,
  Divider,
  Button,
  Space,
  Modal,
  Form,
  Input,
  App as AntApp,
  Row,
  Col,
  Upload,
} from "antd";
import {
  SafetyCertificateOutlined,
  UserOutlined,
  MailOutlined,
  EditOutlined,
  LockOutlined,
  IdcardOutlined,
  HistoryOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// Import Cloudinary
import CloudinaryUpload from "../../components/common/CloudinaryUpload";
import { MOCK_USERS } from "../../constants/mockData.jsx";
import { useCookies } from "react-cookie";
import { AccountApiAdmin } from "../../services/apiAdmin.jsx";

const { Title, Text } = Typography;

const AdminProfile = () => {
  const [cookies, _] = useCookies(["admin"]);
  const [admin, setAdmin] = useState({});

  const { message } = AntApp.useApp();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formUpdate] = Form.useForm();
  const avartarPreview = Form.useWatch("avartar",formUpdate);
  const [formPassword] = Form.useForm();

  // Quản lý link ảnh từ Cloudinary

  const id_admin = cookies.admin.id;
  useEffect(() => {
    const fetchApi = async () => {
      const res = await AccountApiAdmin.myAccount(id_admin);
      
      setAdmin(res.account);
    };
    fetchApi();
    
  }, [id_admin,loading]);

  const handleUpdate = async (values) => {
    
    try {
      const res = await AccountApiAdmin.updateProfile(id_admin,values);
      if(res.status >= 400){
        message.error(res.message)
        return;
      }
      message.success("Cập nhật thành công!");
      setIsEditModalVisible(false);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật!");
    } finally {
      setLoading(true);
      setTimeout(() => {
        setIsEditModalVisible(false);
        setLoading(false);
      }, 1000);
    }
  };

  const handlePasswordChange = async (values) => {
    if (!values.current_password || values.current_password === "") {
      return message.error("Hãy nhập mật khẩu hiện tại");
    }
    if (values.new_password !== values.confirm_password) {
      return message.error("Mật khẩu xác nhận chưa khớp");
    }
    const response = await AccountApiAdmin.changePassword(admin._id,values);
    
    if(response.status >= 400){
      message.error(response.message);
      return;
    }
    message.success(response.message);
    setIsPasswordModalVisible(false);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <Card
        variant={false}
        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        title={
          <Space>
            <SafetyCertificateOutlined
              style={{ color: "#ff4d4f", fontSize: "22px" }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Hệ thống Quản trị viên
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => setIsEditModalVisible(true)}
            >
              Sửa hồ sơ
            </Button>
            <Button
              type="primary"
              danger
              icon={<LockOutlined />}
              onClick={() => setIsPasswordModalVisible(true)}
            >
              Đổi mật khẩu
            </Button>
          </Space>
        }
      >
        <Row gutter={[48, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
                gap: 20,
              }}
            >
              <Avatar
                size={80}
                src={admin.avartar}
                icon={<UserOutlined />}
                style={{ border: "3px solid #fff2f0" }}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {admin.full_name}
                </Title>
                <Text type="secondary">{admin.email}</Text>
              </div>
            </div>

            <Descriptions
              column={1}
              labelStyle={{ fontWeight: "500", color: "#8c8c8c" }}
            >
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> Số điện thoại
                  </span>
                }
              >
                {admin.phone || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> Mã nhân viên
                  </span>
                }
              >
                <Text code>{admin.code_admin}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <LockOutlined /> Trạng thái
                  </span>
                }
              >
                <Tag color="green">
                  {admin.status === "active" ? "Đang hoạt động" : "Bị khóa"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} md={12} style={{ borderLeft: "1px solid #f0f0f0" }}>
            <Title level={5} style={{ marginBottom: 20, color: "#ff4d4f" }}>
              Phân quyền & Bảo mật
            </Title>
            <Descriptions
              column={1}
              labelStyle={{ fontWeight: "500", color: "#8c8c8c" }}
            >
              <Descriptions.Item label="Cấp độ truy cập">
                <Text strong>Level {admin.level}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày gia nhập">{`${new Date(admin.createdAt).getDate()}-${new Date(admin.createdAt).getMonth()}-${new Date(admin.createdAt).getFullYear()}`}</Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <HistoryOutlined /> Lần đăng nhập cuối
                  </span>
                }
              >
                Vừa xong
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin Admin"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => formUpdate.submit()}
        confirmLoading={loading}
        centered
      >
        <Form
          form={formUpdate}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="full_name"
            label="Họ và tên Admin"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, type: "phone" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="avartar">
            <Space direction="vertical" style={{ width: "100%" }}>
              {/* Tích hợp Cloudinary */}
              <CloudinaryUpload onUploadSuccess={(url) => {
                formUpdate.setFieldValue("avartar",url);
              }} />
              
              {avartarPreview && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Xem trước:
                  </Text>
                  <br />
                  <Avatar
                    shape="square"
                    size={64}
                    src={avartarPreview}
                  />
                </div>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        onOk={() => formPassword.submit()}
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
        centered
      >
        <Form
          form={formPassword}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="current_password"
            label="Mật khẩu hiện tại"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 8 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Xác nhận mật khẩu"
            dependencies={["new_password"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProfile;
